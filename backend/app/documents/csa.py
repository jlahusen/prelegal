"""Cloud Service Agreement."""

from app.documents import common
from app.documents.spec import DocumentSpec, Field, Span, party

ORDER_FORM = "Order Form"

SPEC = DocumentSpec(
    doc_type="CSA.md",
    name="Cloud Service Agreement",
    intro=(
        "This Cover Page incorporates by reference the Standard Terms below "
        "to form the parties' Agreement."
    ),
    attribution=(
        "Common Paper Cloud Service Agreement Standard Terms Version 2.1, free "
        "to use under CC BY 4.0, https://creativecommons.org/licenses/by/4.0/."
    ),
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
            description="How long each subscription runs before it renews",
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
        Field(
            key="technicalSupport",
            label="Technical support",
            kind="text",
            section=ORDER_FORM,
            spans=(Span("Technical Support"),),
            placeholder="Technical Support",
            description="Support the provider gives, e.g. 'email support during business hours'",
        ),
        Field(
            key="useLimitations",
            label="Use limitations",
            kind="textarea",
            section=ORDER_FORM,
            spans=(Span("Use Limitations"),),
            inline=False,
            description="Limits on how the product may be used, e.g. a seat or volume cap",
        ),
        Field(
            key="paymentProcess",
            label="Payment process",
            kind="textarea",
            section=ORDER_FORM,
            spans=(Span("Payment Process"),),
            inline=False,
            description="How the customer pays, e.g. 'invoicing, net 30'",
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
