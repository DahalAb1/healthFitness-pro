from datetime import date
from sqlmodel import SQLModel, Field, Relationship


class WorkoutExercise(SQLModel, table=True):
    """
    A single exercise logged within a workout session.
    Previously stored as a JSON blob inside the workout row —
    now a proper table so exercises can be queried and indexed.
    """
    __tablename__ = "workout_exercises"

    id: int | None = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="workout_sessions.id")
    exercise_name: str = Field(min_length=1, max_length=80)
    sets: int = Field(ge=1, le=50)
    reps: int = Field(ge=1, le=200)
    weight: float = Field(ge=0, le=2000)

    session: "WorkoutSession" = Relationship(back_populates="exercises")


class WorkoutSession(SQLModel, table=True):
    """
    A single workout session for a user on a given date.
    Contains a list of exercises logged during the session.
    """
    __tablename__ = "workout_sessions"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(ge=1)
    workout_date: date
    duration_minutes: int = Field(ge=1, le=600)

    exercises: list[WorkoutExercise] = Relationship(
        back_populates="session",
        cascade_delete=True,
    )


# --- Request/response schemas (not database tables) ---
# These inherit from SQLModel but without table=True,
# so they act as pure Pydantic schemas for API validation.

class WorkoutSessionStart(SQLModel):
    """Schema for starting a session without exercises."""
    user_id: int = Field(ge=1)
    workout_date: date
    duration_minutes: int = Field(ge=1, le=600)


class ExerciseLogEntry(SQLModel):
    """Schema for a single exercise in a log request."""
    exercise_name: str = Field(min_length=1, max_length=80)
    sets: int = Field(ge=1, le=50)
    reps: int = Field(ge=1, le=200)
    weight: float = Field(ge=0, le=2000)


class ExerciseLogCreate(SQLModel):
    """Schema for appending exercises to an existing session."""
    exercises: list[ExerciseLogEntry] = Field(min_length=1)


class WorkoutCreate(SQLModel):
    """Schema for creating a full session with exercises in one step."""
    user_id: int = Field(ge=1)
    workout_date: date
    duration_minutes: int = Field(ge=1, le=600)
    exercises: list[ExerciseLogEntry] = Field(min_length=1)


# --- Read schemas (include relationship fields for API serialization) ---

class WorkoutExerciseRead(SQLModel):
    id: int
    exercise_name: str
    sets: int
    reps: int
    weight: float


class WorkoutSessionRead(SQLModel):
    id: int
    user_id: int
    workout_date: date
    duration_minutes: int
    exercises: list[WorkoutExerciseRead] = []
