from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import date
from models import WorkoutCreate, WorkoutSession, WorkoutSessionStart, ExerciseLogCreate
import workout_store

router = APIRouter()


@router.post("/workouts/sessions", response_model=WorkoutSession, status_code=201)
def start_workout_session(payload: WorkoutSessionStart):
    """Start a workout session WITHOUT exercises."""
    return workout_store.create_session(payload)


@router.post("/workouts/sessions/{workout_id}/exercises", response_model=WorkoutSession)
def log_exercises(workout_id: int, payload: ExerciseLogCreate):
    """Append exercise entries to an existing session."""
    try:
        return workout_store.append_exercises(workout_id, payload)
    except KeyError:
        raise HTTPException(status_code=404, detail="Workout not found")


@router.get("/workouts/details", response_model=WorkoutSession)
def get_workout_details_by_date(user_id: int, workout_date: date):
    """View workout details by date for a user."""
    try:
        return workout_store.get_by_date(user_id=user_id, workout_date=workout_date)
    except KeyError:
        raise HTTPException(status_code=404, detail="Workout not found for that user/date")


@router.post("/workouts", response_model=WorkoutSession, status_code=201)
def create_workout(workout: WorkoutCreate):
    """Create a full workout session WITH exercises (one-step)."""
    # Reuse the two-step flow under the hood, so storage stays consistent.
    session = workout_store.create_session(
        WorkoutSessionStart(
            user_id=workout.user_id,
            workout_date=workout.workout_date,
            duration_minutes=workout.duration_minutes,
        )
    )
    session = workout_store.append_exercises(
        session.id,
        ExerciseLogCreate(exercises=workout.exercises),
    )
    return session


@router.get("/workouts", response_model=List[WorkoutSession])
def get_workouts(user_id: Optional[int] = None):
    return workout_store.list_sessions(user_id=user_id)


@router.get("/workouts/{workout_id}", response_model=WorkoutSession)
def get_workout_by_id(workout_id: int):
    try:
        return workout_store.get_by_id(workout_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Workout not found")
