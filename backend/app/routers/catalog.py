"""The catalog of agreement types the product can draft."""

import json
from pathlib import Path

from fastapi import APIRouter, Request

from app.schemas import CatalogEntry

router = APIRouter(tags=["catalog"])


def load_catalog(path: Path) -> list[CatalogEntry]:
    """Read catalog.json from disk. Called once at startup."""
    entries = json.loads(path.read_text(encoding="utf-8"))
    return [CatalogEntry(**entry) for entry in entries]


@router.get("/catalog")
def read_catalog(request: Request) -> list[CatalogEntry]:
    return request.app.state.catalog
