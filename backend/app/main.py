import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.config import get_settings
from app.database import Base, engine
from app.models import Book, BorrowRecord, User  # noqa: F401 — register ORM tables
from app.routes import auth, books, borrow, upload

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s [%(name)s] %(message)s",
)
log = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(_: FastAPI):
    port = int(os.environ.get("PORT", "8000"))
    db = get_settings().database_url
    db_kind = "sqlite" if db.startswith("sqlite") else ("mssql" if "mssql" in db else "other")
    log.info("Lifespan start PORT=%s WEBSITES_PORT=%s db=%s", port, os.environ.get("WEBSITES_PORT"), db_kind)
    try:
        Base.metadata.create_all(bind=engine)
        log.info("DB metadata ready")
    except Exception:
        log.exception("create_all failed")
        raise
    yield
    log.info("Lifespan shutdown")


settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(borrow.router)
app.include_router(upload.router)


@app.get("/")
def root() -> RedirectResponse:
    return RedirectResponse(url="/docs", status_code=307)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)

