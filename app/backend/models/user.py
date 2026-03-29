from typing import Optional
from sqlmodel import SQLModel, Field
from pydantic import EmailStr


# Database table for users
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    email: EmailStr = Field(index=True)  # unique login identifier
    hashed_password: str  # NEVER store plain passwords

    # Profile fields
    display_name: Optional[str] = Field(default=None, max_length=60)
    height_inches: Optional[float] = Field(default=None)
    weight_lbs: Optional[float] = Field(default=None)
    units: str = Field(default="Imperial")
    workout_sounds: str = Field(default="On")
    notifications: str = Field(default="On")


# Request model for registering a new user
class UserRegister(SQLModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


# Response model (what we return to frontend)
class UserRead(SQLModel):
    id: int
    email: EmailStr
    display_name: Optional[str] = None
    height_inches: Optional[float] = None
    weight_lbs: Optional[float] = None
    units: str = "Imperial"
    workout_sounds: str = "On"
    notifications: str = "On"


# Request model for updating profile (all fields optional)
class UserUpdate(SQLModel):
    display_name: Optional[str] = Field(default=None, max_length=60)
    height_inches: Optional[float] = None
    weight_lbs: Optional[float] = None
    units: Optional[str] = None
    workout_sounds: Optional[str] = None
    notifications: Optional[str] = None


# Response model for login (JWT token)
class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"