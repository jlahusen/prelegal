"""Liveness endpoint, used by the start scripts to wait for the container."""

from fastapi import APIRouter

from app import __version__
from app.schemas import Health

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> Health:
    return Health(status="ok", version=__version__)
