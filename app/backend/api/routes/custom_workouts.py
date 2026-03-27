"""Custom workout routes – create, list, and delete user-built workouts."""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from api.deps import get_session, get_current_user
from crud import custom_workouts as custom_workouts_crud
from models.custom_workout import CustomWorkoutCreate
from models.user import User

router = APIRouter()


@router.post("/user-workouts", status_code=201)
def create_user_workout(
    workout: CustomWorkoutCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Save a new custom workout created by the user."""
    return custom_workouts_crud.create(session, workout, current_user.id)


@router.get("/user-workouts")
def get_user_workouts(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return all custom workouts belonging to the logged-in user."""
    return custom_workouts_crud.list_by_user(session, current_user.id)


@router.delete("/user-workouts/{workout_id}")
def delete_user_workout(
    workout_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Delete a custom workout by ID. Returns 404 if not found for that user."""
    deleted = custom_workouts_crud.delete(session, workout_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workout not found")
    return {"deleted": True, "id": workout_id}