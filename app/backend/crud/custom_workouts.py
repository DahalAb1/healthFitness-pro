"""CRUD operations for user-created custom workouts."""

from sqlmodel import Session, select, func
from models.custom_workout import CustomWorkout, CustomWorkoutExercise, CustomWorkoutCreate

# Maximum number of custom workouts a single user can store
MAX_PER_USER = 10


def create(session: Session, data: CustomWorkoutCreate) -> CustomWorkout:
    """
    Create a custom workout. If the user already has MAX_PER_USER,
    the oldest one is deleted first.
    """
    # Count existing workouts for this user
    count = session.exec(
        select(func.count()).where(CustomWorkout.user_id == data.user_id)
    ).one()

    if count >= MAX_PER_USER:
        # Delete the oldest workout for this user
        oldest = session.exec(
            select(CustomWorkout)
            .where(CustomWorkout.user_id == data.user_id)
            .order_by(CustomWorkout.created_at)
            .limit(1)
        ).first()
        if oldest:
            session.delete(oldest)

    workout = CustomWorkout(
        user_id=data.user_id,
        name=data.name,
        main_muscle=data.main_muscle,
        difficulty=data.difficulty,
        duration_minutes=data.duration_minutes,
    )
    for ex in data.exercises:
        workout.exercises.append(
            CustomWorkoutExercise(
                exercise_id=ex.exercise_id,
                exercise_name=ex.exercise_name,
                sets=ex.sets,
                reps=ex.reps,
                weight=ex.weight,
            )
        )
    session.add(workout)
    session.commit()
    session.refresh(workout)
    return workout


def list_all(session: Session) -> list[CustomWorkout]:
    """Return all custom workouts ordered by creation date."""
    return session.exec(
        select(CustomWorkout).order_by(CustomWorkout.created_at)
    ).all()


def list_by_user(session: Session, user_id: int) -> list[CustomWorkout]:
    """Return all custom workouts belonging to a specific user."""
    return session.exec(
        select(CustomWorkout)
        .where(CustomWorkout.user_id == user_id)
        .order_by(CustomWorkout.created_at)
    ).all()


def delete(session: Session, workout_id: int, user_id: int) -> bool:
    """Delete a workout. Returns True if it existed and was deleted."""
    workout = session.exec(
        select(CustomWorkout)
        .where(CustomWorkout.id == workout_id, CustomWorkout.user_id == user_id)
    ).first()
    if not workout:
        return False
    session.delete(workout)
    session.commit()
    return True
