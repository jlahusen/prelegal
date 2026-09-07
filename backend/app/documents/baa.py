"""HIPAA Business Associate Agreement."""

from app.documents import common
from app.documents.spec import DocumentSpec, Field, Span, party

TERMS = "BAA terms"

SPEC = DocumentSpec(
    doc_type="BAA.md",
    name="Business Associate Agreement",
    intro=(
        "This Cover Page incorporates by reference the Standard Terms below "
        "to form the parties' BAA."
    ),
    attribution=common.attribution("BAA", "1.0"),
    fields=(
        *party("company", "Company", 1, role_word="Company"),
        *party("provider", "Provider", 2, role_word="Provider"),
        Field(
            key="effectiveDate",
            label="BAA effective date",
            kind="date",
            section=TERMS,
            spans=(Span("BAA Effective Date"),),
            placeholder="the BAA Effective Date",
            absorbs_article=True,
            shared="effectiveDate",
            description="Date the BAA starts, as yyyy-mm-dd",
        ),
        Field(
            key="agreement",
            label="Underlying agreement",
            kind="text",
            section=TERMS,
            spans=(Span("Agreement"),),
            placeholder="Agreement",
            description=(
                "The agreement this BAA attaches to, e.g. 'Cloud Service "
                "Agreement dated 1 May 2026'"
            ),
        ),
        Field(
            key="breachNotificationPeriod",
            label="Breach notification period",
            kind="duration",
            section=TERMS,
            spans=(Span("Breach Notification Period"),),
            placeholder="the Breach Notification Period",
            absorbs_article=True,
            default="5 days",
            description="How long the provider has to report a breach",
        ),
        Field(
            key="limitations",
            label="Limitations",
            kind="textarea",
            section=TERMS,
            spans=(Span("Limitations"),),
            inline=False,
            description="Restrictions on how the provider may use or disclose PHI",
        ),
    ),
)
