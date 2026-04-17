import os
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _default_database_url() -> str:
    # App Service Linux: wwwroot can be read-only (e.g. run-from-package). SQLite in /tmp avoids startup crash.
    if os.environ.get("WEBSITE_INSTANCE_ID"):
        return "sqlite:////tmp/library.db"
    return "sqlite:///./library.db"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Libra Library API"
    debug: bool = False

    # JWT
    jwt_secret: str = "change-me-in-production-use-openssl-rand"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    # Database: Azure SQL (mssql+pyodbc) or sqlite for local dev (override with DATABASE_URL)
    database_url: str = Field(default_factory=_default_database_url)

    # CORS — comma-separated origins, e.g. http://localhost:5173,https://yourapp.azurewebsites.net
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Azure Blob (optional — upload disabled if unset)
    azure_storage_connection_string: str | None = None
    azure_blob_container: str = "book-covers"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
