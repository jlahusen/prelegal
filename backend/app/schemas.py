"""Request and response models for the API."""

from datetime import datetime
from typing import Any, Literal

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


class ChatMessage(BaseModel):
    """One turn of the conversation. Clients cannot send system messages."""

    role: Literal["user", "assistant"]
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    """The conversation so far, plus the form state it is filling in.

    No doc_type means no agreement has been chosen yet, so the conversation
    is still about which one to draft.
    """

    doc_type: str | None = None
    messages: list[ChatMessage] = Field(min_length=1)
    current: dict[str, Any] = Field(default_factory=dict)


class FieldUpdate(BaseModel):
    """A field the conversation settled.

    The path is a plain string here: which paths are legal depends on the
    document, so the request's JSON Schema enum is what constrains the model.
    """

    field: str
    value: str


class ChatResponse(BaseModel):
    reply: str
    doc_type: str | None = None
    updates: list[FieldUpdate] = Field(default_factory=list)


class FieldOut(BaseModel):
    """A field as the form and the cover page need it."""

    key: str
    label: str
    kind: str
    section: str
    placeholder: str
    choices: list[str]
    default: str
    shared: str
    inline: bool
    required_unless: tuple[str, str] | None


class ClauseOut(BaseModel):
    number: str
    title: str
    body: str
    children: list["ClauseOut"] = Field(default_factory=list)


class DocumentTypeOut(BaseModel):
    """Everything the client needs to draft one agreement."""

    doc_type: str
    name: str
    intro: str
    attribution: str
    sections: list[str]
    fields: list[FieldOut]
    clauses: list[ClauseOut]
