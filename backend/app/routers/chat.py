"""Chat that fills in a draft. Stateless: the client sends the whole conversation.

Without a doc_type the conversation is still about which agreement to draft,
so it goes to the intake prompt instead of a document's own.
"""

from fastapi import APIRouter, HTTPException, Request, status

from app import document_chat, intake_chat
from app.documents import registry
from app.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
def chat(payload: ChatRequest, request: Request) -> ChatResponse:
    if payload.doc_type is None:
        return intake_chat.run_chat(payload.messages, request.app.state.catalog)
    try:
        spec = registry.get(payload.doc_type)
    except KeyError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Cannot draft {payload.doc_type}")
    return document_chat.run_chat(spec, payload.messages, payload.current)
