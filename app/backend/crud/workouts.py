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
    user_id: int,
    exercises: list[ExerciseLogEntry],
) -> WorkoutSession:
    """Add exercises to an existing session."""
    workout = session.exec(
        select(WorkoutSession).where(
            WorkoutSession.id == workout_id,
            WorkoutSession.user_id == user_id,
        )
    ).first()
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
    # Re-query with selectinload so the returned object has exercises populated
    # (session.refresh only reloads scalar columns, not relationships)
    query = (
        select(WorkoutSession)
        .where(
            WorkoutSession.id == workout_id,
            WorkoutSession.user_id == user_id,
        )
        .options(selectinload(WorkoutSession.exercises))
    )
    refreshed = session.exec(query).first()
    return refreshed


def get_by_id(
    session: Session,
    workout_id: int,
    user_id: int,
) -> WorkoutSession | None:
    """Fetch a single workout session belonging to a specific user."""
    return session.exec(
        select(WorkoutSession)
        .where(
            WorkoutSession.id == workout_id,
            WorkoutSession.user_id == user_id,
        )
        .options(selectinload(WorkoutSession.exercises))
    ).first()


def list_sessions(session: Session, user_id: int) -> list[WorkoutSession]:
    """Return all workout sessions belonging to a specific user."""
    query = (
        select(WorkoutSession)
        .where(WorkoutSession.user_id == user_id)
        .order_by(WorkoutSession.workout_date, WorkoutSession.id)
    )
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
