"""The drafting conversation, for whichever agreement is being filled in.

Turns the conversation so far into one reply plus the fields it settled. The
model may only name fields the document actually has: the request carries them
as a JSON Schema enum, which the preset answers under strict mode.
"""

from typing import Any

from app.documents import registry
from app.documents.spec import DocumentSpec, Field, UNITS
from app.openrouter import complete
from app.schemas import ChatMessage, ChatResponse

INSTRUCTIONS = """You help someone fill in a {name} by talking to them.

Lead the conversation until the agreement is complete. Ask about the fields \
below in a natural order, at most two at a time, in plain language. Keep your \
replies short. Every reply must end with a question about the next unfilled \
field until every field is filled: never just acknowledge an answer and stop.

If the conversation so far was about choosing which agreement to draft, say in \
one sentence that you are starting the {name}, then ask your first questions.

When the user gives you a value, including one mentioned while choosing the \
agreement, record it \
in `updates` using the exact field path. Only record what the user actually \
told you: never invent a value, and never record a field that is already set \
correctly.

Fields that already have a default are suggestions to confirm, not answers the \
user has given.

Once every field is filled, say so and offer to change anything.

If the user asks for a different agreement, do not switch straight away. Warn \
them that switching discards everything filled in so far and starts the new \
agreement from scratch, and ask them to confirm. Set `switch_to` only once they \
have confirmed; otherwise leave it empty. The other agreements are:
{others}

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


def defaults(spec: DocumentSpec) -> dict[str, str]:
    """The values a fresh form starts with, keyed by the paths the chat sets."""
    values: dict[str, str] = {}
    for entry in spec.fields:
        if entry.kind == "duration":
            value, _, unit = entry.default.partition(" ")
            values[f"{entry.key}.value"] = value
            values[f"{entry.key}.unit"] = unit or "years"
        else:
            values[entry.key] = entry.default
    return values


def _others(spec: DocumentSpec) -> str:
    return "\n".join(
        f"- {other.name} ({other.doc_type})"
        for other in registry.SPECS.values()
        if other.doc_type != spec.doc_type
    )


def build_system_prompt(spec: DocumentSpec, current: dict[str, Any]) -> str:
    """The instructions, the field spec, and whatever the form already holds."""
    instructions = INSTRUCTIONS.format(name=spec.name, others=_others(spec))
    return f"{instructions}{_field_list(spec)}\n\nAlready filled in:\n{_filled(spec, current)}"


def response_schema(spec: DocumentSpec) -> dict[str, Any]:
    return {
        "type": "object",
        "additionalProperties": False,
        "required": ["reply", "updates", "switch_to"],
        "properties": {
            "reply": {"type": "string", "description": "Your next message to the user."},
            "switch_to": {
                "type": ["string", "null"],
                "enum": [doc for doc in registry.SPECS if doc != spec.doc_type] + [None],
                "description": "Another agreement to start over with, once the user confirms.",
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
    if answer.get("switch_to"):
        return start(registry.get(answer["switch_to"]))
    result = ChatResponse.model_validate({**answer, "doc_type": spec.doc_type})
    # The schema enum already limits the model. This is what keeps a field
    # belonging to some other agreement out of this one's data.
    paths = set(spec.paths)
    result.updates = [update for update in result.updates if update.field in paths]
    return result


def start(spec: DocumentSpec) -> ChatResponse:
    """Open a fresh conversation for `spec`: nothing carried over, first questions asked."""
    opening = [ChatMessage(role="user", content=f"I want to draft a {spec.name}.")]
    return run_chat(spec, opening, defaults(spec))
