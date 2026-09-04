"""SQLite storage.

The database is disposable: it is deleted and recreated from scratch on every
startup, which is what the container's throwaway data model expects.
"""

import sqlite3
from collections.abc import Iterator
from pathlib import Path

from fastapi import Request

SCHEMA = """
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    doc_type TEXT NOT NULL,
    title TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
"""


def connect(path: Path) -> sqlite3.Connection:
    """Open a connection that returns rows as mappings.

    check_same_thread is off because FastAPI runs a sync dependency's setup, the
    endpoint, and its teardown on separate threadpool threads. Each connection
    still belongs to exactly one request, so it is never shared between them.
    """
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def reset_database(path: Path) -> None:
    """Drop any existing database file and recreate an empty schema."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.unlink(missing_ok=True)
    conn = connect(path)
    try:
        conn.executescript(SCHEMA)
    finally:
        conn.close()


def get_db(request: Request) -> Iterator[sqlite3.Connection]:
    """Per-request connection, closed once the response is sent."""
    conn = connect(request.app.state.database_path)
    try:
        yield conn
    finally:
        conn.close()
