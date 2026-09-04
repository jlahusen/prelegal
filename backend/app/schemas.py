"""Request and response models for the API."""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

from app.mutual_nda_fields import FieldPath


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


class ChatMessage(BaseModel):
    """One turn of the conversation. Clients cannot send system messages."""

    role: Literal["user", "assistant"]
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    """The conversation so far, plus the form state it is filling in."""

    messages: list[ChatMessage] = Field(min_length=1)
    current: dict[str, Any] = Field(default_factory=dict)


class FieldUpdate(BaseModel):
    field: FieldPath
    value: str


class ChatResponse(BaseModel):
    reply: str
    updates: list[FieldUpdate] = Field(default_factory=list)
