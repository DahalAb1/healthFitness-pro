from pydantic import BaseModel
from typing import List
from datetime import date


# ---- Workout History Models ----

class ExerciseEntry(BaseModel):
    exercise_name: str
    sets: int
    reps: int
    weight: float


class WorkoutCreate(BaseModel):
    user_id: int
    workout_date: date
    duration_minutes: int
    exercises: List[ExerciseEntry]


class WorkoutSession(WorkoutCreate):
    id: int


# ---- Exercise Library Models ----

class Exercise(BaseModel):
    id: str
    name: str
    muscle_group: str
    equipment: str
    description: List[str]
    image_url: str


class ExerciseListResponse(BaseModel):
    exercises: List[Exercise]