"""The drafting conversation, for whichever agreement is being filled in.

Turns the conversation so far into one reply plus the fields it settled. The
model may only name fields the document actually has: the request carries them
as a JSON Schema enum, which the preset answers under strict mode.
"""

from typing import Any

from app.documents.spec import DocumentSpec, Field, UNITS
from app.openrouter import complete
from app.schemas import ChatMessage, ChatResponse

INSTRUCTIONS = """You help someone fill in a {name} by talking to them.

Ask about the fields below in a natural order, at most two at a time, in plain \
language. Keep your replies short. When the user gives you a value, record it \
in `updates` using the exact field path. Only record what the user actually \
told you: never invent a value, and never record a field that is already set \
correctly.

Fields that already have a default are suggestions to confirm, not answers the \
user has given.

Once every field is filled, say so and offer to change anything.

Fields:
"""


def _lines(entry: Field) -> list[str]:
    """What the model is told a field means, one line per path it can set."""
    if entry.kind != "duration":
        return [f"- {entry.key}: {entry.description}"]
    return [
        f"- {entry.key}.value: {entry.description}, as a whole number",
        f"- {entry.key}.unit: unit for {entry.label.lower()}, one of {', '.join(UNITS)}",
    ]


def _field_list(spec: DocumentSpec) -> str:
    return "\n".join(line for entry in spec.fields for line in _lines(entry))


def _value(raw: Any) -> str:
    """Booleans are written the way the field descriptions ask for them."""
    return str(raw).lower() if isinstance(raw, bool) else str(raw)


def _filled(spec: DocumentSpec, current: dict[str, Any]) -> str:
    known = [
        f"- {path}: {_value(current[path])}"
        for path in spec.paths
        if current.get(path) not in (None, "")
    ]
    return "\n".join(known) if known else "- (nothing yet)"


def build_system_prompt(spec: DocumentSpec, current: dict[str, Any]) -> str:
    """The instructions, the field spec, and whatever the form already holds."""
    instructions = INSTRUCTIONS.format(name=spec.name)
    return f"{instructions}{_field_list(spec)}\n\nAlready filled in:\n{_filled(spec, current)}"


def response_schema(spec: DocumentSpec) -> dict[str, Any]:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": ["reply", "updates"],
        "properties": {
            "reply": {"type": "string", "description": "Your next message to the user."},
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
                        "field": {"type": "string", "enum": list(spec.paths)},
                        "value": {
                            "type": "string",
                            "description": "The value, written as it should appear.",
                        },
                    },
                },
            },
        },
    }


def run_chat(
    spec: DocumentSpec, messages: list[ChatMessage], current: dict[str, Any]
) -> ChatResponse:
    """Answer the latest user message and report any fields it settled."""
    wire = [
        {"role": "system", "content": build_system_prompt(spec, current)},
        *({"role": m.role, "content": m.content} for m in messages),
    ]
    answer = complete(wire, "document_chat_turn", response_schema(spec))
    result = ChatResponse.model_validate({**answer, "doc_type": spec.doc_type})
    # The schema enum already limits the model. This is what keeps a field
    # belonging to some other agreement out of this one's data.
    paths = set(spec.paths)
    result.updates = [update for update in result.updates if update.field in paths]
    return result
