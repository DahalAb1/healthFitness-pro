from sqlmodel import SQLModel, Field
from pydantic import EmailStr


# Database table for users
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    email: EmailStr = Field(index=True)  # unique login identifier
    hashed_password: str  # NEVER store plain passwords


# Request model for registering a new user
class UserRegister(SQLModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


# Request model for login
class UserLogin(SQLModel):
    email: EmailStr
    password: str


# Response model (what we return to frontend)
class UserRead(SQLModel):
    id: int
    email: EmailStr


# Response model for login (JWT token)
class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"