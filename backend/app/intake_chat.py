"""Working out which agreement someone wants before any drafting starts.

The catalog is the whole menu. When someone asks for something not on it, the
model has to offer the nearest agreement we can actually draft and say why,
rather than refuse: the schema gives it no way to name anything else.
"""

from typing import Any

from app.openrouter import complete
from app.schemas import CatalogEntry, ChatMessage, ChatResponse

INSTRUCTIONS = """You help someone choose which agreement to draft. These are \
the only agreements available:

{catalog}

If their request matches one, choose it.

If their request is for something else entirely, do not say you cannot help. \
Name the closest agreement on the list, explain in one sentence why it is the \
nearest fit and how it differs from what they asked for, and ask whether to \
start it. Only set `doc_type` once they agree, or when their request clearly \
matches an agreement already.

Leave `doc_type` empty while you are still asking. Keep replies short.
"""


def _catalog_block(catalog: list[CatalogEntry]) -> str:
    return "\n".join(f"- {entry.name} ({entry.filename}): {entry.description}" for entry in catalog)


def response_schema(catalog: list[CatalogEntry]) -> dict[str, Any]:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": ["reply", "doc_type"],
        "properties": {
            "reply": {"type": "string", "description": "Your next message to the user."},
            "doc_type": {
                "type": ["string", "null"],
                "enum": [entry.filename for entry in catalog] + [None],
                "description": "The agreement to start, once it is settled.",
            },
        },
    }


def run_chat(messages: list[ChatMessage], catalog: list[CatalogEntry]) -> ChatResponse:
    """Answer the latest message, naming a document once one is agreed."""
    wire = [
        {"role": "system", "content": INSTRUCTIONS.format(catalog=_catalog_block(catalog))},
        *({"role": m.role, "content": m.content} for m in messages),
    ]
    answer = complete(wire, "document_intake_turn", response_schema(catalog))
    return ChatResponse(reply=answer["reply"], doc_type=answer["doc_type"])
