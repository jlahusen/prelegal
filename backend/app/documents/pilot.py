"""Pilot Agreement for a time-boxed product evaluation."""

from app.documents import common
from app.documents.spec import DocumentSpec, Field, Span, party

TERMS = "Pilot terms"

SPEC = DocumentSpec(
    doc_type="Pilot-Agreement.md",
    name="Pilot Agreement",
    intro=(
        "This Cover Page incorporates by reference the Standard Terms below "
        "to form the parties' Agreement."
    ),
    attribution=common.attribution("Pilot Agreement", "1.1"),
    fields=(
        *party("customer", "Customer", 1, role_word="Customer"),
        *party("provider", "Provider", 2, role_word="Provider"),
        Field(
            key="pilotPeriod",
            label="Pilot period",
            kind="duration",
            section=TERMS,
            spans=(Span("Pilot Period"),),
            inline=False,
            default="60 days",
            description="How long the evaluation runs",
        ),
        common.effective_date(TERMS),
        Field(
            key="generalCapAmount",
            label="General cap amount",
            kind="currency",
            section=TERMS,
            spans=(Span("General Cap Amount"),),
            placeholder="the General Cap Amount",
            absorbs_article=True,
            description="Limit on each party's total liability, e.g. '$50,000'",
        ),
        common.notice_address(TERMS),
        common.governing_law(TERMS),
        common.chosen_courts(TERMS),
    ),
)
