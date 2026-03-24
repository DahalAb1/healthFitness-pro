"""CRUD operations for workout sessions and exercises."""

from datetime import date
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from models.workout import WorkoutSession, WorkoutExercise, ExerciseLogEntry


def create_session(
    session: Session,
    user_id: int,
    workout_date: date,
    duration_minutes: int,
) -> WorkoutSession:
    """Create a workout session without exercises."""
    workout = WorkoutSession(
        user_id=user_id,
        workout_date=workout_date,
        duration_minutes=duration_minutes,
    )
    session.add(workout)
    session.commit()
    session.refresh(workout)
    return workout


def append_exercises(
    session: Session,
    workout_id: int,
    exercises: list[ExerciseLogEntry],
) -> WorkoutSession:
    """Add exercises to an existing session."""
    workout = session.get(WorkoutSession, workout_id)
    if not workout:
        raise KeyError("Workout not found")

    for ex in exercises:
        workout.exercises.append(
            WorkoutExercise(
                exercise_name=ex.exercise_name,
                sets=ex.sets,
                reps=ex.reps,
                weight=ex.weight,
            )
        )
    session.commit()
    session.refresh(workout)
    return workout


def get_by_id(session: Session, workout_id: int) -> WorkoutSession | None:
    """Fetch a single workout session by primary key."""
    return session.get(WorkoutSession, workout_id)


def list_sessions(session: Session, user_id: int | None = None) -> list[WorkoutSession]:
    """Return all workout sessions, optionally filtered by user ID."""
    query = select(WorkoutSession).order_by(WorkoutSession.workout_date, WorkoutSession.id)
    if user_id is not None:
        query = query.where(WorkoutSession.user_id == user_id)
    return session.exec(query).all()


def get_by_date(session: Session, user_id: int, workout_date: date) -> WorkoutSession | None:
    """Find the most recent workout session for a user on a given date."""
    query = (
        select(WorkoutSession)
        .where(WorkoutSession.user_id == user_id, WorkoutSession.workout_date == workout_date)
        .order_by(WorkoutSession.id.desc())
        .options(selectinload(WorkoutSession.exercises))
    )
    result = session.exec(query).first()
    if result:
        _ = result.exercises  # ensure exercises are loaded before session closes
    return result


def get_weight_progress(
    session: Session,
    user_id: int,
    exercise_name: str,
) -> dict[str, float]:
    """
    Returns a dict of ISO date string -> max weight for that exercise.
    Queries the exercise table directly instead of loading all sessions.
    """
    query = (
        select(WorkoutExercise)
        .join(WorkoutSession)
        .where(
            WorkoutSession.user_id == user_id,
            WorkoutExercise.exercise_name == exercise_name,
        )
        .order_by(WorkoutSession.workout_date)
    )
    rows = session.exec(query).all()

    per_date_max: dict[str, float] = {}
    for row in rows:
        d = row.session.workout_date.isoformat()
        per_date_max[d] = max(per_date_max.get(d, 0), row.weight)

    return per_date_max
