"""Shared fixtures: every test gets its own throwaway database."""

import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import create_app


@pytest.fixture
def db_path(tmp_path, monkeypatch):
    path = tmp_path / "prelegal.db"
    monkeypatch.setenv("DATABASE_PATH", str(path))
    monkeypatch.setenv("STATIC_DIR", str(tmp_path / "no-frontend-build"))
    get_settings.cache_clear()
    yield path
    get_settings.cache_clear()


@pytest.fixture
def client(db_path):
    with TestClient(create_app()) as client:
        yield client


@pytest.fixture
def draft():
    return {
        "doc_type": "Mutual-NDA.md",
        "title": "Acme / Globex NDA",
        "data": {"partyA": {"name": "Acme"}, "purpose": "Evaluating a partnership"},
    }
