from datetime import date
from sqlmodel import SQLModel


# --- Exercise library schemas ---
# These are not database tables. They define the shape of data
# coming from the external exercise API (RapidAPI).

class Exercise(SQLModel):
    """A single exercise returned from the exercise library."""
    id: str
    name: str
    muscle_group: str
    equipment: str
    description: str
    image_url: str


class ExerciseListResponse(SQLModel):
    """Wrapper for a list of exercises."""
    exercises: list[Exercise]


# --- Progress tracking schemas ---

class ProgressPoint(SQLModel):
    """A single data point: weight lifted on a given date."""
    date: date
    weight: float


class WeightProgressResponse(SQLModel):
    """Full progress report for a user's exercise over time."""
    exercise_name: str
    points: list[ProgressPoint]
    first_weight: float | None = None
    last_weight: float | None = None
    change: float | None = None
    percent_change: float | None = None
