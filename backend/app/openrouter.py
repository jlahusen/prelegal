"""Structured-output calls to OpenRouter.

Knows nothing about any particular agreement: callers supply the messages and
the JSON schema the model must answer with.
"""

import json
from typing import Any

import httpx2

from app.config import get_settings

API_URL = "https://openrouter.ai/api/v1/chat/completions"

# The project routes every model choice through this preset.
PRESET = "@preset/prelegal"

TIMEOUT_SECONDS = 60


def complete(
    messages: list[dict[str, str]], schema_name: str, schema: dict[str, Any]
) -> dict[str, Any]:
    """Ask the preset for one reply that conforms to `schema`, and parse it."""
    settings = get_settings()
    response = httpx2.post(
        API_URL,
        headers={"Authorization": f"Bearer {settings.openrouter_api_key}"},
        json={
            "model": PRESET,
            "messages": messages,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": schema_name,
                    "strict": True,
                    "schema": schema,
                },
            },
        },
        timeout=TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return json.loads(response.json()["choices"][0]["message"]["content"])
