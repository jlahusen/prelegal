"""Service Level Agreement, used alongside a Cloud Service Agreement."""

from app.documents import common
from app.documents.spec import DocumentSpec, Field, Span, party

TERMS = "Service levels"


def _target(key: str, label: str, span: str, description: str) -> Field:
    """Targets and credits are defined terms: "at least the Target Uptime",
    "eligible to receive an Uptime Credit". Their values sit on the cover page."""
    return Field(
        key=key,
        label=label,
        kind="text",
        section=TERMS,
        spans=(Span(span),),
        inline=False,
        description=description,
    )


SPEC = DocumentSpec(
    doc_type="SLA.md",
    name="Service Level Agreement",
    intro=(
        "This Cover Page incorporates by reference the Standard Terms below "
        "and supplements the parties' Cloud Service Agreement."
    ),
    attribution=common.attribution("Service Level Agreement", "2.0"),
    fields=(
        *party("customer", "Customer", 1, role_word="Customer"),
        *party("provider", "Provider", 2, role_word="Provider"),
        _target("targetUptime", "Target uptime", "Target Uptime",
                "Uptime the provider aims for each month, e.g. '99.9%'"),
        _target("targetResponseTime", "Target response time", "Target Response Time",
                "How quickly the provider aims to answer support requests, e.g. '4 business hours'"),
        _target("scheduledDowntime", "Scheduled downtime", "Scheduled Downtime",
                "Maintenance windows that do not count against uptime"),
        Field(
            key="supportChannel",
            label="Support channel",
            kind="text",
            section=TERMS,
            spans=(Span("Support Channel"),),
            placeholder="the Support Channel",
            absorbs_article=True,
            description="Where support requests are sent, e.g. 'support@acme.com'",
        ),
        _target("uptimeCredit", "Uptime credit", "Uptime Credit",
                "Credit owed when uptime falls short, e.g. '5% of monthly fees'"),
        _target("responseTimeCredit", "Response time credit", "Response Time Credit",
                "Credit owed when a support response is late"),
        Field(
            key="subscriptionPeriod",
            label="Subscription period",
            kind="duration",
            section=TERMS,
            spans=(Span("Subscription Period"),),
            inline=False,
            default="1 years",
            description="The subscription period this SLA is measured over",
        ),
    ),
)
