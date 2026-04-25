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
    DATABASE_URL: str = "sqlite:///./app.db"
    XRAPID_API_KEY: str = ""
    FATSECRET_CLIENT_ID: str = ""
    FATSECRET_CLIENT_SECRET: str = ""       # OAuth 2.0 client secret
    FATSECRET_CONSUMER_SECRET: str = ""    # OAuth 1.0a consumer secret (different!)

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

# Single instance used across the app
settings = Settings()
