"""Partnership Agreement."""

from app.documents import common
from app.documents.spec import DocumentSpec, Field, Span, party

BUSINESS = "Business terms"

SPEC = DocumentSpec(
    doc_type="Partnership-Agreement.md",
    name="Partnership Agreement",
    intro=(
        "This Cover Page incorporates by reference the Standard Terms below "
        "to form the parties' Agreement."
    ),
    attribution=common.attribution("Partnership", "1.0"),
    fields=(
        *party("company", "Company", 1, role_word="Company"),
        *party("partner", "Partner", 2, role_word="Partner"),
        common.defined_term(
            "obligations", "Obligations", "Obligations",
            "What each party commits to do", BUSINESS,
        ),
        common.defined_term(
            "paymentProcess", "Payment process", "Payment Process",
            "How payments are made, if there are any", BUSINESS,
        ),
        common.defined_term(
            "paymentSchedule", "Payment schedule", "Payment Schedule",
            "When payments fall due", BUSINESS,
        ),
        common.defined_term(
            "territory", "Territory", "Territory",
            "Where the trademark licence applies, e.g. worldwide", BUSINESS,
        ),
        common.defined_term(
            "brandGuidelines", "Brand guidelines", "Brand Guidelines",
            "Rules for using the other party's brand", BUSINESS,
        ),
        Field(
            key="endDate",
            label="End date",
            kind="date",
            section=BUSINESS,
            spans=(Span("End Date"),),
            placeholder="the End Date",
            absorbs_article=True,
            description="Date the partnership ends, as yyyy-mm-dd",
        ),
        common.effective_date(),
        common.governing_law(),
        common.chosen_courts(),
        *common.liability_terms(),
        common.covered_claims("Company"),
        common.covered_claims("Partner"),
        common.additional_warranties(),
        common.dpa_term(),
    ),
)
