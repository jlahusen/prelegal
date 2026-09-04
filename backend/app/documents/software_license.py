"""Software License Agreement for installed software."""

from app.documents import common
from app.documents.spec import DocumentSpec, Field, Span, party

ORDER_FORM = "Order Form"

SPEC = DocumentSpec(
    doc_type="Software-License-Agreement.md",
    name="Software License Agreement",
    intro=(
        "This Cover Page incorporates by reference the Standard Terms below "
        "to form the parties' Agreement."
    ),
    attribution=common.attribution("Software License", "1.1"),
    fields=(
        *party("customer", "Customer", 1, role_word="Customer"),
        *party("provider", "Provider", 2, role_word="Provider"),
        Field(
            key="orderDate",
            label="Order date",
            kind="date",
            section=ORDER_FORM,
            spans=(Span("Order Date"),),
            placeholder="the Order Date",
            absorbs_article=True,
            description="Date the order starts, as yyyy-mm-dd",
        ),
        Field(
            key="subscriptionPeriod",
            label="Subscription period",
            kind="duration",
            section=ORDER_FORM,
            spans=(Span("Subscription Period"), Span("Subscription Periods")),
            inline=False,
            default="1 years",
            description="How long each licence runs before it renews",
        ),
        Field(
            key="nonRenewalNoticeDate",
            label="Non-renewal notice date",
            kind="date",
            section=ORDER_FORM,
            spans=(Span("Non-Renewal Notice Date"),),
            placeholder="the Non-Renewal Notice Date",
            absorbs_article=True,
            description="Last date to give notice of non-renewal, as yyyy-mm-dd",
        ),
        common.defined_term(
            "permittedUses", "Permitted uses", "Permitted Uses",
            "What the customer may use the software for", ORDER_FORM,
        ),
        common.defined_term(
            "licenseLimits", "Licence limits", "License Limits",
            "Limits on the licence, e.g. seats or installations", ORDER_FORM,
        ),
        common.defined_term(
            "paymentProcess", "Payment process", "Payment Process",
            "How the customer pays, e.g. invoicing net 30", ORDER_FORM,
        ),
        common.defined_term(
            "deletionProcedure", "Deletion procedure", "Deletion Procedure",
            "How the customer removes the software when the licence ends", ORDER_FORM,
        ),
        common.period(
            "warrantyPeriod", "Warranty period", "Warranty Period",
            "How long the software is warranted to conform", "90 days", ORDER_FORM,
        ),
        common.effective_date(),
        common.governing_law(),
        common.chosen_courts(),
        *common.liability_terms(),
        common.covered_claims("Provider"),
        common.covered_claims("Customer"),
        common.additional_warranties(),
    ),
)
