"""The database is meant to be disposable — every startup begins empty."""

from concurrent.futures import ThreadPoolExecutor

from app.db import connect, reset_database
from app.main import create_app
from fastapi.testclient import TestClient


def test_startup_discards_drafts_from_the_previous_run(client, draft, db_path):
    client.post("/api/documents", json=draft)

    with TestClient(create_app()) as restarted:
        assert restarted.get("/api/documents").json() == []


def test_reset_recreates_a_missing_database_file(db_path):
    reset_database(db_path)

    assert db_path.exists()


def test_connection_survives_the_threadpool_hand_off(db_path):
    """FastAPI opens, uses and closes a request's connection on different threads."""
    reset_database(db_path)
    conn = connect(db_path)

    with ThreadPoolExecutor(max_workers=1) as pool:
        pool.submit(conn.execute, "SELECT 1").result()
        pool.submit(conn.close).result()
