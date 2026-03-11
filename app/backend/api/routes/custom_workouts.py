"""Custom workout routes – create, list, and delete user-built workouts."""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from api.deps import get_session
from crud import custom_workouts as custom_workouts_crud
from models.custom_workout import CustomWorkoutCreate

router = APIRouter()


@router.post("/user-workouts", status_code=201)
def create_user_workout(workout: CustomWorkoutCreate, session: Session = Depends(get_session)):
    """Save a new custom workout created by the user."""
    return custom_workouts_crud.create(session, workout)


@router.get("/user-workouts")
def get_user_workouts(user_id: int | None = None, session: Session = Depends(get_session)):
    """Return all custom workouts, or only those belonging to a specific user."""
    if user_id is None:
        return custom_workouts_crud.list_all(session)
    return custom_workouts_crud.list_by_user(session, user_id)


@router.delete("/user-workouts/{workout_id}")
def delete_user_workout(workout_id: int, user_id: int, session: Session = Depends(get_session)):
    """Delete a custom workout by ID. Returns 404 if not found for that user."""
    deleted = custom_workouts_crud.delete(session, workout_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workout not found")
    return {"deleted": True, "id": workout_id}
