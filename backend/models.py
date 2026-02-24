from pydantic import BaseModel
from typing import List, Optional
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


# ---- Custom Workout Models ----

class CustomWorkoutExercise(BaseModel):
    exercise_id: Optional[str] = None
    exercise_name: str
    sets: int
    reps: int
    weight: Optional[float] = None


class UserWorkoutCreate(BaseModel):
    user_id: int
    name: str
    main_muscle: Optional[str] = None
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = None
    exercises: List[CustomWorkoutExercise]


class UserWorkout(UserWorkoutCreate):
    id: int