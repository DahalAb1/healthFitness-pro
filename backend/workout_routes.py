from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import date
from models import WorkoutCreate, WorkoutSession, WorkoutSessionStart, ExerciseLogCreate

router = APIRouter()

# Temporary in-memory storage
workouts_db: List[WorkoutSession] = []
current_id = 1


def _find_workout(workout_id: int) -> WorkoutSession:
    for w in workouts_db:
        if w.id == workout_id:
            return w
    raise HTTPException(status_code=404, detail="Workout not found")


@router.post("/workouts/sessions", response_model=WorkoutSession, status_code=201)
def start_workout_session(payload: WorkoutSessionStart):
    """
    Start a workout session WITHOUT exercises.
    """
    global current_id

    new_workout = WorkoutSession(
        id=current_id,
        user_id=payload.user_id,
        workout_date=payload.workout_date,
        duration_minutes=payload.duration_minutes,
        exercises=[],
    )

    workouts_db.append(new_workout)
    current_id += 1
    return new_workout


@router.post("/workouts/sessions/{workout_id}/exercises", response_model=WorkoutSession)
def log_exercises(workout_id: int, payload: ExerciseLogCreate):
    """
    Append exercise entries to an existing session.
    """
    workout = _find_workout(workout_id)
    workout.exercises.extend(payload.exercises)
    return workout


@router.get("/workouts/details", response_model=WorkoutSession)
def get_workout_details_by_date(user_id: int, workout_date: date):
    """
    View workout details by date for a user.
    """
    for w in workouts_db:
        if w.user_id == user_id and w.workout_date == workout_date:
            return w
    raise HTTPException(status_code=404, detail="Workout not found for that user/date")


@router.post("/workouts", response_model=WorkoutSession, status_code=201)
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
    return _find_workout(workout_id)