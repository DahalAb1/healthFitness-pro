from fastapi import APIRouter
from typing import List, Optional
from models import WorkoutCreate, WorkoutSession

router = APIRouter()

# Temporary in-memory storage
workouts_db = []
current_id = 1


@router.post("/workouts", response_model=WorkoutSession)
def create_workout(workout: WorkoutCreate):
    global current_id

    new_workout = WorkoutSession(
        id=current_id,
        **workout.model_dump()
    )

    workouts_db.append(new_workout)
    current_id += 1

    return new_workout


@router.get("/workouts", response_model=List[WorkoutSession])
def get_workouts(user_id: Optional[int] = None):
    if user_id is None:
        return workouts_db
    return [w for w in workouts_db if w.user_id == user_id]