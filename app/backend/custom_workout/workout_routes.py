from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import UserWorkoutCreate, UserWorkout
from custom_workout.saved_workouts_store import list_workouts, list_workouts_for_user, add_workout, delete_workout

router = APIRouter()

MAX_USER_WORKOUTS = 10


@router.post("/user-workouts", response_model=UserWorkout, status_code=201)
def create_user_workout(workout: UserWorkoutCreate):
    # Persist the workout via persistence layer (enforces MAX_USER_WORKOUTS)
    workout_dict = workout.model_dump()
    saved = add_workout(workout_dict, max_per_user=MAX_USER_WORKOUTS)
    return UserWorkout(**saved)


@router.get("/user-workouts", response_model=List[UserWorkout])
def get_user_workouts(user_id: Optional[int] = None):
    if user_id is None:
        return list_workouts()
    return list_workouts_for_user(user_id)


@router.delete("/user-workouts/{workout_id}")
def delete_user_workout(workout_id: int, user_id: int):
    deleted = delete_workout(workout_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workout not found")
    return {"deleted": True, "id": workout_id}