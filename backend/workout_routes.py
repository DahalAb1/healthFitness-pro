from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import WorkoutCreate, WorkoutSession, UserWorkoutCreate, UserWorkout

router = APIRouter()

# Temporary in-memory storage
workouts_db = []
current_id = 1

# Temporary in-memory storage for custom workouts
user_workouts_db = []
user_workout_current_id = 1


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
    global user_workout_current_id

    new_workout = UserWorkout(
        id=user_workout_current_id,
        **workout.model_dump()
    )

    user_workouts_db.append(new_workout)
    user_workout_current_id += 1

    return new_workout


@router.get("/user-workouts", response_model=List[UserWorkout])
def get_user_workouts(user_id: Optional[int] = None):
    if user_id is None:
        return user_workouts_db
    return [w for w in user_workouts_db if w.user_id == user_id]