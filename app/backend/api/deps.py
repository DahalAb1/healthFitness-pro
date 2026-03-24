from collections.abc import Generator
from sqlmodel import Session
from core.db import engine


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
