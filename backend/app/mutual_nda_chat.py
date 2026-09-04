"""The Mutual NDA drafting conversation.

Turns the conversation so far into one reply plus the fields it settled.
"""

from typing import Any

from app.mutual_nda_fields import FIELD_PATHS, FIELDS
from app.openrouter import complete
from app.schemas import ChatMessage, ChatResponse

SCHEMA_NAME = "mutual_nda_chat_turn"

RESPONSE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["reply", "updates"],
    "properties": {
        "reply": {
            "type": "string",
            "description": "Your next message to the user.",
        },
        "updates": {
            "type": "array",
            "description": (
                "Fields this turn established. Leave out any field the user "
                "has not answered, and any field that is already correct."
            ),
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["field", "value"],
                "properties": {
                    "field": {"type": "string", "enum": list(FIELD_PATHS)},
                    "value": {
                        "type": "string",
                        "description": "The value, written as it should appear.",
                    },
                },
            },
        },
    },
}

INSTRUCTIONS = """You help someone fill in a Mutual Non-Disclosure Agreement by \
talking to them.

Ask about the fields below in a natural order, at most two at a time, in plain \
language. Keep your replies short. When the user gives you a value, record it \
in `updates` using the exact field path. Only record what the user actually \
told you: never invent a value, and never record a field that is already set \
correctly.

Both term durations start at a default (2 years for the agreement, 3 years for \
confidentiality). Treat those as suggestions to confirm, not as answers the \
user has given.

Once every field is filled, say so and offer to change anything.

Fields:
"""


def _field_list() -> str:
    return "\n".join(f"- {path}: {description}" for path, description in FIELDS.items())


def _flatten(current: dict[str, Any]) -> dict[str, str]:
    """Current form state as dotted paths, keeping only the filled-in fields."""
    flat: dict[str, str] = {}
    for path in FIELD_PATHS:
        parent, _, child = path.partition(".")
        value = current.get(parent, {}).get(child) if child else current.get(path)
        if isinstance(value, bool):
            value = str(value).lower()
        if value not in (None, ""):
            flat[path] = str(value)
    return flat


def build_system_prompt(current: dict[str, Any]) -> str:
    """The instructions, the field spec, and whatever the form already holds."""
    known = _flatten(current)
    filled = (
        "\n".join(f"- {path}: {value}" for path, value in known.items())
        if known
        else "- (nothing yet)"
    )
    return f"{INSTRUCTIONS}{_field_list()}\n\nAlready filled in:\n{filled}"


def run_chat(messages: list[ChatMessage], current: dict[str, Any]) -> ChatResponse:
    """Answer the latest user message and report any fields it settled."""
    wire = [
        {"role": "system", "content": build_system_prompt(current)},
        *({"role": m.role, "content": m.content} for m in messages),
    ]
    return ChatResponse.model_validate(complete(wire, SCHEMA_NAME, RESPONSE_SCHEMA))
