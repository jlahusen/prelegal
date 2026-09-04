"""What a document type is: its fields, and how they map onto its template.

One spec per agreement in the catalog. The spec is the only hand-written part
of a document type -- the prose itself is parsed from templates/ and never
copied here.
"""

from dataclasses import dataclass
from typing import Literal

Kind = Literal["text", "textarea", "date", "duration", "currency", "choice", "boolean"]
Form = Literal["base", "possessive", "plural"]

UNITS = ("days", "months", "years")


@dataclass(frozen=True)
class Span:
    """One exact surface form of a field inside the template's prose."""

    text: str
    form: Form = "base"


@dataclass(frozen=True)
class Field:
    """A value the user supplies, and where it appears in the agreement."""

    key: str
    label: str
    kind: Kind
    section: str
    description: str
    spans: tuple[Span, ...] = ()
    placeholder: str = ""
    choices: tuple[str, ...] = ()
    default: str = ""
    shared: str = ""
    absorbs_article: bool = False
    required_unless: tuple[str, str] | None = None

    @property
    def paths(self) -> tuple[str, ...]:
        """The dotted paths the chat may set. A duration carries value and unit."""
        if self.kind == "duration":
            return (f"{self.key}.value", f"{self.key}.unit")
        return (self.key,)


@dataclass(frozen=True)
class Override:
    """A span occurrence that must read as fixed words rather than a value.

    Common Paper repeats a defined term where substituting the value would be
    ungrammatical -- "provisions of such Delaware" instead of "of such State".
    """

    text: str
    occurrence: int
    literal: str


@dataclass(frozen=True)
class DocumentSpec:
    doc_type: str
    name: str
    fields: tuple[Field, ...]
    attribution: str
    overrides: tuple[Override, ...] = ()
    intro: str = ""

    def field_for(self, span_text: str) -> tuple[Field, Form]:
        """The field a template span fills, and which grammatical form to use."""
        for entry in self.fields:
            for span in entry.spans:
                if span.text == span_text:
                    return entry, span.form
        raise KeyError(f"{self.doc_type}: no field claims the span {span_text!r}")

    def override_for(self, span_text: str, occurrence: int) -> str | None:
        for override in self.overrides:
            if override.text == span_text and override.occurrence == occurrence:
                return override.literal
        return None

    @property
    def paths(self) -> tuple[str, ...]:
        return tuple(path for entry in self.fields for path in entry.paths)

    @property
    def sections(self) -> tuple[str, ...]:
        seen: list[str] = []
        for entry in self.fields:
            if entry.section not in seen:
                seen.append(entry.section)
        return tuple(seen)


PARTY_PARTS = (
    ("name", "Legal name", "Legal name of {label}, e.g. 'Acme, Inc.'"),
    ("address", "Address", "Postal address of {label}"),
    ("signatoryName", "Signatory name", "Name of the person signing for {label}"),
    ("signatoryTitle", "Signatory title", "Job title of that signatory, e.g. 'CEO'"),
)


def party(key: str, label: str, index: int, name_spans: tuple[Span, ...] = ()) -> tuple[Field, ...]:
    """The four fields every party needs, in the order they are signed for.

    `name_spans` are the template spans naming this party in the prose, so a
    clause reads "Acme, Inc. may access the Product" once the name is known.
    """
    return tuple(
        Field(
            key=f"{key}.{part}",
            label=heading,
            kind="text",
            section=label,
            description=description.format(label=label),
            spans=name_spans if part == "name" else (),
            placeholder=label if part == "name" else "",
            shared=f"party{index}.{part}",
        )
        for part, heading, description in PARTY_PARTS
    )
