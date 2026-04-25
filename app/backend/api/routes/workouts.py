"""Workout routes – sessions, exercise logging, and workout retrieval."""

from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from api.deps import get_session, get_current_user
from crud import workouts as workouts_crud
from models.user import User
from models.workout import (
    WorkoutCreate,
    WorkoutSessionStart,
    ExerciseLogCreate,
    WorkoutSessionRead,
)

router = APIRouter(tags=["workouts"])


@router.post(
    "/workouts/sessions",
    status_code=201,
    summary="Start a workout session",
)
def start_workout_session(
    payload: WorkoutSessionStart,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Create a new workout session for the authenticated user."""
    return workouts_crud.create_session(
        session,
        user_id=current_user.id,
        workout_date=payload.workout_date,
        duration_minutes=payload.duration_minutes,
    )


@router.post(
    "/workouts/sessions/{workout_id}/exercises",
    summary="Log exercises for a workout session",
)
def log_exercises(
    workout_id: int,
    payload: ExerciseLogCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Add exercise entries to an existing workout session for the authenticated user."""
    workout = workouts_crud.get_by_id(session, workout_id, current_user.id)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    try:
        return workouts_crud.append_exercises(
            session,
            workout_id,
            current_user.id,
            payload.exercises,
        )
    except KeyError:
        raise HTTPException(status_code=404, detail="Workout not found")


@router.get(
    "/workouts/details",
    response_model=WorkoutSessionRead,
    summary="Get workout details by date",
)
def get_workout_details_by_date(
    workout_date: date,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return a workout for the authenticated user for a given date."""
    workout = workouts_crud.get_by_date(session, current_user.id, workout_date)
    if not workout:
        raise HTTPException(
            status_code=404,
            detail="Workout not found for that user/date",
        )
    return workout


@router.post(
    "/workouts",
    status_code=201,
    response_model=WorkoutSessionRead,
    summary="Create a workout",
)
def create_workout(
    payload: WorkoutCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Create a complete workout for the authenticated user."""
    workout = workouts_crud.create_session(
        session,
        user_id=current_user.id,
        workout_date=payload.workout_date,
        duration_minutes=payload.duration_minutes,
    )
    workout = workouts_crud.append_exercises(
        session,
        workout.id,
        current_user.id,
        payload.exercises,
    )
    return workout


@router.get(
    "/workouts",
    summary="List workouts",
)
def get_workouts(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """List all workout sessions for the authenticated user."""
    return workouts_crud.list_sessions(session, user_id=current_user.id)


@router.get(
    "/workouts/{workout_id}",
    summary="Get workout by ID",
)
def get_workout_by_id(
    workout_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return a single workout by ID for the authenticated user."""
    workout = workouts_crud.get_by_id(session, workout_id, current_user.id)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout