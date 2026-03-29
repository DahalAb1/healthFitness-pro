from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


class CustomWorkoutExercise(SQLModel, table=True):
    """
    A single exercise within a user-created custom workout.
    Previously stored as a JSON blob — now a proper table.
    """
    __tablename__ = "custom_workout_exercises"

    id: int | None = Field(default=None, primary_key=True)
    workout_id: int = Field(foreign_key="custom_workouts.id")
    exercise_id: str | None = None
    exercise_name: str
    sets: int
    reps: int
    weight: float | None = None

    workout: "CustomWorkout" = Relationship(back_populates="exercises")


class CustomWorkout(SQLModel, table=True):
    """
    A user-created workout plan (e.g. "My Upper Body Routine").
    Users can save up to 10 custom workouts.
    """
    __tablename__ = "custom_workouts"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int
    name: str
    main_muscle: str | None = None
    difficulty: str | None = None
    duration_minutes: int | None = None
    created_at: datetime | None = Field(default_factory=datetime.utcnow)

    exercises: list[CustomWorkoutExercise] = Relationship(
        back_populates="workout",
        cascade_delete=True,
    )


# --- Request schema ---

class CustomWorkoutExerciseCreate(SQLModel):
    """Schema for a single exercise in a create request."""
    exercise_id: str | None = None
    exercise_name: str
    sets: int
    reps: int
    weight: float | None = None


class CustomWorkoutCreate(SQLModel):
    """Schema for creating a new custom workout."""
    user_id: int = 0  # overwritten by route from authenticated user
    name: str
    main_muscle: str | None = None
    difficulty: str | None = None
    duration_minutes: int | None = None
    exercises: list[CustomWorkoutExerciseCreate]


# --- Response schemas (include nested exercises) ---

class CustomWorkoutExerciseRead(SQLModel):
    """Exercise fields returned to the client."""
    id: int
    exercise_id: str | None = None
    exercise_name: str
    sets: int
    reps: int
    weight: float | None = None


class CustomWorkoutRead(SQLModel):
    """Custom workout with its exercises included."""
    id: int
    user_id: int
    name: str
    main_muscle: str | None = None
    difficulty: str | None = None
    duration_minutes: int | None = None
    created_at: datetime | None = None
    exercises: list[CustomWorkoutExerciseRead] = []
