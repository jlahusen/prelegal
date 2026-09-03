"""Request and response models for the API."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class Health(BaseModel):
    status: str
    version: str


class CatalogEntry(BaseModel):
    name: str
    description: str
    filename: str


class DocumentInput(BaseModel):
    """A document draft as submitted by the client."""

    doc_type: str = Field(min_length=1)
    title: str = Field(min_length=1)
    data: dict[str, Any] = Field(default_factory=dict)


class DocumentSummary(BaseModel):
    """A stored draft without its field data, for listings."""

    id: str
    doc_type: str
    title: str
    created_at: datetime
    updated_at: datetime


class Document(DocumentSummary):
    data: dict[str, Any]
