from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from api.deps import get_session
from crud import workouts as workouts_crud
from models.workout import WorkoutCreate, WorkoutSessionStart, ExerciseLogCreate

router = APIRouter()


@router.post("/workouts/sessions", status_code=201)
def start_workout_session(payload: WorkoutSessionStart, session: Session = Depends(get_session)):
    return workouts_crud.create_session(
        session,
        user_id=payload.user_id,
        workout_date=payload.workout_date,
        duration_minutes=payload.duration_minutes,
    )


@router.post("/workouts/sessions/{workout_id}/exercises")
def log_exercises(workout_id: int, payload: ExerciseLogCreate, session: Session = Depends(get_session)):
    try:
        return workouts_crud.append_exercises(session, workout_id, payload.exercises)
    except KeyError:
        raise HTTPException(status_code=404, detail="Workout not found")


@router.get("/workouts/details")
def get_workout_details_by_date(user_id: int, workout_date: date, session: Session = Depends(get_session)):
    workout = workouts_crud.get_by_date(session, user_id, workout_date)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found for that user/date")
    return workout


@router.post("/workouts", status_code=201)
def create_workout(payload: WorkoutCreate, session: Session = Depends(get_session)):
    workout = workouts_crud.create_session(
        session,
        user_id=payload.user_id,
        workout_date=payload.workout_date,
        duration_minutes=payload.duration_minutes,
    )
    workouts_crud.append_exercises(session, workout.id, payload.exercises)
    return workout


@router.get("/workouts")
def get_workouts(user_id: int | None = None, session: Session = Depends(get_session)):
    return workouts_crud.list_sessions(session, user_id=user_id)


@router.get("/workouts/{workout_id}")
def get_workout_by_id(workout_id: int, session: Session = Depends(get_session)):
    workout = workouts_crud.get_by_id(session, workout_id)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout
