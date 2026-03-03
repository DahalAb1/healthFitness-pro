import os
import json
import sqlite3
from typing import List, Optional, Dict
from datetime import date

from models import WorkoutSession, ExerciseEntry, WorkoutSessionStart, ExerciseLogCreate

_DB_PATH = os.path.join(os.path.dirname(__file__), "workout_history.db")


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = _connect()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS workout_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                workout_date TEXT NOT NULL,
                duration_minutes INTEGER NOT NULL,
                exercises_json TEXT NOT NULL DEFAULT '[]'
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ws_user_date ON workout_sessions(user_id, workout_date)")
        conn.commit()
    finally:
        conn.close()


def _row_to_session(row: sqlite3.Row) -> WorkoutSession:
    exercises_raw = json.loads(row["exercises_json"] or "[]")
    # Validate each exercise with Pydantic
    exercises: List[ExerciseEntry] = [ExerciseEntry(**ex) for ex in exercises_raw]
    return WorkoutSession(
        id=int(row["id"]),
        user_id=int(row["user_id"]),
        workout_date=date.fromisoformat(row["workout_date"]),
        duration_minutes=int(row["duration_minutes"]),
        exercises=exercises,
    )


def create_session(payload: WorkoutSessionStart) -> WorkoutSession:
    init_db()
    conn = _connect()
    try:
        cur = conn.execute(
            """
            INSERT INTO workout_sessions(user_id, workout_date, duration_minutes, exercises_json)
            VALUES (?, ?, ?, ?)
            """,
            (payload.user_id, payload.workout_date.isoformat(), payload.duration_minutes, "[]"),
        )
        conn.commit()
        new_id = cur.lastrowid
        row = conn.execute("SELECT * FROM workout_sessions WHERE id = ?", (new_id,)).fetchone()
        return _row_to_session(row)
    finally:
        conn.close()


def append_exercises(workout_id: int, payload: ExerciseLogCreate) -> WorkoutSession:
    init_db()
    conn = _connect()
    try:
        row = conn.execute("SELECT * FROM workout_sessions WHERE id = ?", (workout_id,)).fetchone()
        if row is None:
            raise KeyError("Workout not found")

        current = json.loads(row["exercises_json"] or "[]")
        # Pydantic validation on incoming exercises
        validated = [ExerciseEntry(**ex.model_dump()) for ex in payload.exercises]
        current.extend([ex.model_dump() for ex in validated])

        conn.execute(
            "UPDATE workout_sessions SET exercises_json = ? WHERE id = ?",
            (json.dumps(current), workout_id),
        )
        conn.commit()

        row2 = conn.execute("SELECT * FROM workout_sessions WHERE id = ?", (workout_id,)).fetchone()
        return _row_to_session(row2)
    finally:
        conn.close()


def get_by_id(workout_id: int) -> WorkoutSession:
    init_db()
    conn = _connect()
    try:
        row = conn.execute("SELECT * FROM workout_sessions WHERE id = ?", (workout_id,)).fetchone()
        if row is None:
            raise KeyError("Workout not found")
        return _row_to_session(row)
    finally:
        conn.close()


def list_sessions(user_id: Optional[int] = None) -> List[WorkoutSession]:
    init_db()
    conn = _connect()
    try:
        if user_id is None:
            rows = conn.execute("SELECT * FROM workout_sessions ORDER BY workout_date ASC, id ASC").fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY workout_date ASC, id ASC",
                (user_id,),
            ).fetchall()
        return [_row_to_session(r) for r in rows]
    finally:
        conn.close()


def get_by_date(user_id: int, workout_date: date) -> WorkoutSession:
    init_db()
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT * FROM workout_sessions WHERE user_id = ? AND workout_date = ? ORDER BY id DESC LIMIT 1",
            (user_id, workout_date.isoformat()),
        ).fetchone()
        if row is None:
            raise KeyError("Workout not found")
        return _row_to_session(row)
    finally:
        conn.close()


def get_weight_progress_points(user_id: int, exercise_name: str) -> Dict[str, float]:
    """
    Returns a dict of ISO date string -> max weight for that date for the given exercise.
    """
    ex_name = exercise_name.strip()
    if not ex_name:
        raise ValueError("exercise_name cannot be empty")

    sessions = list_sessions(user_id=user_id)
    per_date_max: Dict[str, float] = {}

    for w in sessions:
        best = None
        for ex in w.exercises:
            if ex.exercise_name.lower() == ex_name.lower():
                best = ex.weight if best is None else max(best, ex.weight)

        if best is None:
            continue

        d = w.workout_date.isoformat()
        per_date_max[d] = best if d not in per_date_max else max(per_date_max[d], best)

    return per_date_max