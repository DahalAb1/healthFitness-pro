from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Central configuration loaded from environment variables / .env file.

    Replaces scattered os.getenv() calls with a single typed object.
    Any file can access config via: from core.config import settings
    """

    # Tells Pydantic to read values from a .env file (same as load_dotenv)
    model_config = {"env_file": ".env", "extra": "ignore"}

    # Each field maps to an env var by name. Pydantic validates the type
    # and uses the default if the env var is missing.
    DATABASE_URL: str
    XRAPID_API_KEY: str = ""


# Single instance used across the app
settings = Settings()
