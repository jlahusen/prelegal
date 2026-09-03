"""CRUD for document drafts.

Drafts are anonymous: V1 has no user accounts, so every draft is visible to
everyone using the instance.
"""

import json
import sqlite3
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status

from app.db import get_db
from app.schemas import Document, DocumentInput, DocumentSummary

router = APIRouter(prefix="/documents", tags=["documents"])


def _to_document(row: sqlite3.Row) -> Document:
    return Document(**{**dict(row), "data": json.loads(row["data"])})


def _fetch(conn: sqlite3.Connection, document_id: str) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM documents WHERE id = ?", (document_id,)).fetchone()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No document with id {document_id}")
    return row


@router.get("")
def list_documents(conn: sqlite3.Connection = Depends(get_db)) -> list[DocumentSummary]:
    rows = conn.execute(
        "SELECT id, doc_type, title, created_at, updated_at FROM documents"
        " ORDER BY updated_at DESC"
    ).fetchall()
    return [DocumentSummary(**dict(row)) for row in rows]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_document(
    payload: DocumentInput, conn: sqlite3.Connection = Depends(get_db)
) -> Document:
    now = datetime.now(UTC).isoformat()
    document_id = uuid4().hex
    conn.execute(
        "INSERT INTO documents (id, doc_type, title, data, created_at, updated_at)"
        " VALUES (?, ?, ?, ?, ?, ?)",
        (
            document_id,
            payload.doc_type,
            payload.title,
            json.dumps(payload.data),
            now,
            now,
        ),
    )
    conn.commit()
    return _to_document(_fetch(conn, document_id))


@router.get("/{document_id}")
def read_document(document_id: str, conn: sqlite3.Connection = Depends(get_db)) -> Document:
    return _to_document(_fetch(conn, document_id))


@router.put("/{document_id}")
def update_document(
    document_id: str, payload: DocumentInput, conn: sqlite3.Connection = Depends(get_db)
) -> Document:
    _fetch(conn, document_id)
    conn.execute(
        "UPDATE documents SET doc_type = ?, title = ?, data = ?, updated_at = ? WHERE id = ?",
        (
            payload.doc_type,
            payload.title,
            json.dumps(payload.data),
            datetime.now(UTC).isoformat(),
            document_id,
        ),
    )
    conn.commit()
    return _to_document(_fetch(conn, document_id))


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, conn: sqlite3.Connection = Depends(get_db)) -> None:
    _fetch(conn, document_id)
    conn.execute("DELETE FROM documents WHERE id = ?", (document_id,))
    conn.commit()
