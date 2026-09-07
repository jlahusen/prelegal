"""Professional Services Agreement, worked through statements of work."""

from app.documents import common
from app.documents.spec import DocumentSpec, party

SOW = "Statement of work"

SPEC = DocumentSpec(
    doc_type="PSA.md",
    name="Professional Services Agreement",
    intro=(
        "This Cover Page incorporates by reference the Standard Terms below "
        "to form the parties' Agreement."
    ),
    attribution=common.attribution("Professional Services Agreement"),
    fields=(
        *party("customer", "Customer", 1, role_word="Customer"),
        *party("provider", "Provider", 2, role_word="Provider"),
        common.defined_term(
            "deliverables", "Deliverables", "Deliverables",
            "What the provider will deliver", SOW,
        ),
        common.defined_term(
            "deliverable", "Deliverable (singular)", "Deliverable",
            "A single deliverable, as the acceptance clauses refer to it", SOW,
        ),
        common.defined_term(
            "fees", "Fees", "Fees",
            "What the customer pays for the services", SOW,
        ),
        common.period(
            "rejectionPeriod", "Rejection period", "Rejection Period",
            "How long the customer has to reject a deliverable", "10 days", SOW,
        ),
        common.period(
            "resubmissionPeriod", "Resubmission period", "Resubmission Period",
            "How long the provider has to correct and resubmit", "10 days", SOW,
        ),
        common.period(
            "paymentPeriod", "Payment period", "Payment Period",
            "How long the customer has to pay an invoice", "30 days", SOW,
        ),
        common.defined_term(
            "timeOfAssignment", "Time of assignment", "Time of Assignment",
            "When ownership of the deliverables passes to the customer", SOW,
        ),
        common.defined_term(
            "customerObligations", "Customer obligations", "Customer Obligations",
            "What the customer must do for the work to proceed", SOW,
        ),
        common.defined_term(
            "sowTerm", "SOW term", "SOW Term",
            "How long a statement of work runs", SOW,
        ),
        common.defined_term(
            "customerPolicies", "Customer policies", "Customer Policies",
            "Customer policies the provider must follow, if any",
        ),
        common.defined_term(
            "securityPolicy", "Security policy", "Security Policy",
            "Security standards the provider must meet, if any",
        ),
        common.defined_term(
            "insuranceMinimums", "Insurance minimums", "Insurance Minimums",
            "Insurance cover each party must carry, if any",
        ),
        common.effective_date(),
        common.governing_law(),
        common.chosen_courts(),
        *common.liability_terms(),
        common.covered_claims("Provider"),
        common.covered_claims("Customer"),
        common.additional_warranties(),
        common.dpa_term(),
    ),
)
