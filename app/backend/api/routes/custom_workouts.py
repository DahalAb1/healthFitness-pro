"""Custom workout routes – create, list, and delete user-built workouts."""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from api.deps import get_session, get_current_user
from crud import custom_workouts as custom_workouts_crud
from models.custom_workout import CustomWorkoutCreate, CustomWorkoutRead
from models.user import User

router = APIRouter(tags=["custom workouts"])


@router.post(
    "/user-workouts",
    status_code=201,
    response_model=CustomWorkoutRead,
    summary="Create a custom workout",
)
def create_user_workout(
    workout: CustomWorkoutCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Create a new custom workout for the authenticated user."""
    workout.user_id = current_user.id
    return custom_workouts_crud.create(session, workout)


@router.get(
    "/user-workouts",
    response_model=list[CustomWorkoutRead],
    summary="List custom workouts",
)
def get_user_workouts(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return all custom workouts for the authenticated user."""
    return custom_workouts_crud.list_by_user(session, current_user.id)


@router.delete(
    "/user-workouts/{workout_id}",
    summary="Delete a custom workout",
)
def delete_user_workout(
    workout_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Delete a custom workout by ID for the authenticated user."""
    deleted = custom_workouts_crud.delete(session, workout_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workout not found")
    return {"deleted": True, "id": workout_id}