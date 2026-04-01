"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """All configuration is loaded from environment variables.
    Never hardcode secrets — fail fast if missing."""

    # App
    app_name: str = "ATHENA"
    environment: str = "development"
    debug: bool = False
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"
    cors_origins: str = "http://localhost:3005,http://localhost:3000,http://localhost:3002,http://localhost:3003"

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    database_url: str

    # Euri AI (OpenAI-compatible gateway via Euron)
    euri_api_key: str
    euri_base_url: str = "https://api.euron.one/api/v1/euri"

    # Tavily (web search for Researcher agent)
    tavily_api_key: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Rate Limiting
    rate_limit_free: int = 30  # requests per minute
    rate_limit_pro: int = 120
    rate_limit_ultra: int = 300
    rate_limit_developer: int = 600

    # Agent Config
    max_agent_iterations: int = 10
    default_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — loaded once, reused everywhere."""
    return Settings()
