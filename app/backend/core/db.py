from sqlmodel import SQLModel, create_engine
from core.config import settings
from models.user import User

# The engine is the connection to the database.
# It uses DATABASE_URL from our central settings (core/config.py).
engine = create_engine(settings.DATABASE_URL, echo=False)


def create_db_and_tables():
    """
    Creates all tables defined by SQLModel classes.
    Called once at app startup in main.py.
    """
    SQLModel.metadata.create_all(engine)
