"""Chat that fills in a draft. Stateless: the client sends the whole conversation."""

from fastapi import APIRouter

from app import mutual_nda_chat
from app.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/mutual-nda")
def mutual_nda(payload: ChatRequest) -> ChatResponse:
    return mutual_nda_chat.run_chat(payload.messages, payload.current)
