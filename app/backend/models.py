from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List
from datetime import date


# ---- Workout History Models ----

class ExerciseEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")

    exercise_name: str = Field(..., min_length=1, max_length=80)
    sets: int = Field(..., ge=1, le=50)
    reps: int = Field(..., ge=1, le=200)
    weight: float = Field(..., ge=0, le=2000)

    @field_validator("exercise_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("exercise_name cannot be empty")
        return cleaned

# Base model (allows empty exercises for sessions)
class WorkoutBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: int = Field(..., ge=1)
    workout_date: date
    duration_minutes: int = Field(..., ge=1, le=600)
    exercises: List[ExerciseEntry] = Field(default_factory=list)


# Creating a full workout requires at least 1 exercise
class WorkoutCreate(WorkoutBase):
    exercises: List[ExerciseEntry] = Field(..., min_length=1)

class WorkoutSession(WorkoutBase):
    id: int = Field(..., ge=1)

class WorkoutSessionStart(BaseModel):
    model_config = ConfigDict(extra="forbid")
    user_id: int = Field(..., ge=1)
    workout_date: date
    duration_minutes: int = Field(..., ge=1, le=600)

class ExerciseLogCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    exercises: List[ExerciseEntry] = Field(..., min_length=1)


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