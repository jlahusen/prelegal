"""Application settings, resolved from the environment and the project .env file."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent


class Settings(BaseSettings):
    """Runtime configuration. Every field can be overridden by an env var of the same name."""

    model_config = SettingsConfigDict(env_file=PROJECT_ROOT / ".env", extra="ignore")

    database_path: Path = BACKEND_DIR / "prelegal.db"
    static_dir: Path = PROJECT_ROOT / "frontend" / "out"
    catalog_path: Path = PROJECT_ROOT / "catalog.json"
    templates_dir: Path = PROJECT_ROOT / "templates"
    cors_origins: list[str] = ["http://localhost:3000"]
    openrouter_api_key: str = ""


@lru_cache
def get_settings() -> Settings:
    """Cached settings, so the environment is read once per process."""
    return Settings()
