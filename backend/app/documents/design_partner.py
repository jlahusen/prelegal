"""Design Partner Agreement."""

from app.documents import common
from app.documents.spec import DocumentSpec, Field, Span, party

TERMS = "Program terms"

SPEC = DocumentSpec(
    doc_type="Design-Partner-Agreement.md",
    name="Design Partner Agreement",
    intro=(
        "This Cover Page incorporates by reference the Standard Terms below "
        "to form the parties' Agreement."
    ),
    attribution=common.attribution("Design Partner Agreement"),
    fields=(
        *party("partner", "Partner", 1, role_word="Partner"),
        *party("provider", "Provider", 2, role_word="Provider"),
        Field(
            key="program",
            label="Program",
            kind="text",
            section=TERMS,
            spans=(Span("Program"),),
            placeholder="Program",
            description="Name of the design partner program, e.g. 'Acme Design Partner Program'",
        ),
        Field(
            key="term",
            label="Term",
            kind="duration",
            section=TERMS,
            spans=(Span("Term"),),
            placeholder="the Term",
            absorbs_article=True,
            default="6 months",
            description="How long the partner has early access",
        ),
        Field(
            key="fees",
            label="Fees",
            kind="currency",
            section=TERMS,
            spans=(Span("Fees"),),
            placeholder="the Fees",
            absorbs_article=True,
            description="What the partner pays, if anything, e.g. '$0' or '$5,000'",
        ),
        common.effective_date(TERMS),
        common.notice_address(TERMS),
        common.governing_law(TERMS),
        common.chosen_courts(TERMS),
    ),
)
