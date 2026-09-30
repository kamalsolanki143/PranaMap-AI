from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "PranaMap AI"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/pranamap"
    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    WEATHER_API_KEY: Optional[str] = None
    SATELLITE_API_URL: Optional[str] = None

    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    GOOGLE_CLOUD_PROJECT: Optional[str] = None
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_SERVICE_ACCOUNT_JSON: Optional[str] = None
    DATA_PROVIDER_API_KEY: Optional[str] = None

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://prana-map-ai.vercel.app",
        "https://pranamap-ai.vercel.app",
        "https://prana-map-ai-*.vercel.app",
        "*",
    ]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
