from collections.abc import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select

from core.db import engine
from core.security import decode_access_token
from models.user import User


# This tells FastAPI where login happens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session to route handlers.

    Usage in a route:
        @router.get("/items")
        def get_items(session: Session = Depends(get_session)):
            ...

    The 'yield' makes it a context manager — the session is automatically
    closed after the request finishes, even if an error occurs.
    """
    with Session(engine) as session:
        yield session


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
):
    """
    FastAPI dependency that:
    1. Reads the Bearer token from the Authorization header
    2. Decodes the JWT
    3. Extracts the user's email from the token payload
    4. Loads the matching user from the database

    Raises 401 if the token is missing, invalid, expired, or the user
    no longer exists.
    """
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    email = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
