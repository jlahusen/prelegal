"""FastAPI application: JSON API under /api, static frontend at the root."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import __version__
from app.config import get_settings
from app.db import reset_database
from app.routers import catalog, chat, document_types, documents, health
from app.routers.catalog import load_catalog
from app.routers.document_types import load_documents


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start every run with an empty database, and the templates read in.

    Parsing here means a template a spec no longer fits stops the app rather
    than reaching someone's contract.
    """
    settings = get_settings()
    reset_database(settings.database_path)
    app.state.database_path = settings.database_path
    app.state.catalog = load_catalog(settings.catalog_path)
    app.state.documents = load_documents(settings.templates_dir)
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Prelegal API", version=__version__, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    for router in (
        health.router,
        catalog.router,
        document_types.router,
        documents.router,
        chat.router,
    ):
        app.include_router(router, prefix="/api")

    # Present only once the frontend has been built (always so in the container).
    if settings.static_dir.is_dir():
        app.mount("/", StaticFiles(directory=settings.static_dir, html=True), name="frontend")

    return app


app = create_app()
