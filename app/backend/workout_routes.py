from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import WorkoutCreate, WorkoutSession, UserWorkoutCreate, UserWorkout
from saved_workouts_store import list_workouts, list_workouts_for_user, add_workout

router = APIRouter()

# Temporary in-memory storage
workouts_db = []
current_id = 1

# Persistence via persistence.py for custom workouts
MAX_USER_WORKOUTS = 10


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


@router.get("/workouts/{workout_id}", response_model=WorkoutSession)
def get_workout_by_id(workout_id: int):
    for w in workouts_db:
        if w.id == workout_id:
            return w
    raise HTTPException(status_code=404, detail="Workout not found")


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