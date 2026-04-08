from datetime import date
from sqlmodel import SQLModel, Field


class MealLog(SQLModel, table=True):
    """One food item logged to a meal for a given user and date."""
    __tablename__ = "meal_logs"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(ge=1)
    log_date: date
    meal_type: str = Field(max_length=20)   # breakfast | lunch | dinner | misc
    food_name: str = Field(max_length=200)
    kcal: float = Field(ge=0)
    protein_g: float | None = Field(default=None, ge=0)
    carbs_g: float | None = Field(default=None, ge=0)
    fat_g: float | None = Field(default=None, ge=0)


class MealLogCreate(SQLModel):
    log_date: date
    meal_type: str
    food_name: str
    kcal: float
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None


class MealLogRead(SQLModel):
    id: int
    log_date: date
    meal_type: str
    food_name: str
    kcal: float
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None
