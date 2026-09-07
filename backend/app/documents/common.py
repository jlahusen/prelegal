"""Field groups the Common Paper agreements share.

Governing law, liability caps and covered claims are worded almost identically
across the commercial templates, so they are built here once rather than
restated in ten specs.
"""

from app.documents.spec import Field, Span

KEY_TERMS = "Key Terms"


def effective_date(section: str = KEY_TERMS, label: str = "Effective date") -> Field:
    return Field(
        key="effectiveDate",
        label=label,
        kind="date",
        section=section,
        spans=(Span("Effective Date"),),
        placeholder="the Effective Date",
        absorbs_article=True,
        shared="effectiveDate",
        description="Date the agreement starts, as yyyy-mm-dd",
    )


def governing_law(section: str = KEY_TERMS) -> Field:
    return Field(
        key="governingLaw",
        label="Governing law",
        kind="text",
        section=section,
        spans=(Span("Governing Law"),),
        placeholder="Governing Law",
        absorbs_article=True,
        shared="governingLaw",
        description=(
            "The body of law that governs, written so it can start a sentence, "
            "e.g. 'Delaware law'"
        ),
    )


def chosen_courts(section: str = KEY_TERMS) -> Field:
    return Field(
        key="chosenCourts",
        label="Chosen courts",
        kind="text",
        section=section,
        spans=(Span("Chosen Courts"),),
        placeholder="Chosen Courts",
        shared="jurisdiction",
        description=(
            "Courts that hear disputes, completing 'in the ___', e.g. 'state "
            "and federal courts located in Wilmington, Delaware'"
        ),
    )


def covered_claims(role: str, section: str = KEY_TERMS) -> Field:
    """The claims one side indemnifies. A defined term, so it stays in the prose."""
    return Field(
        key=f"{role[0].lower()}{role[1:]}CoveredClaims",
        label=f"{role} covered claims",
        kind="textarea",
        section=section,
        spans=(Span(f"{role} Covered Claim"), Span(f"{role} Covered Claims")),
        inline=False,
        optional=True,
        description=f"Claims {role} indemnifies the other party against",
    )


def liability_terms(section: str = KEY_TERMS) -> tuple[Field, ...]:
    return (
        Field(
            key="generalCapAmount",
            label="General cap amount",
            kind="currency",
            section=section,
            spans=(Span("General Cap Amount"),),
            placeholder="the General Cap Amount",
            absorbs_article=True,
            description="Ordinary limit on each party's total liability, e.g. '$100,000'",
        ),
        Field(
            key="increasedCapAmount",
            optional=True,
            label="Increased cap amount",
            kind="currency",
            section=section,
            spans=(Span("Increased Cap Amount"),),
            placeholder="the Increased Cap Amount",
            absorbs_article=True,
            description="Higher liability limit that applies to Increased Claims",
        ),
        Field(
            key="increasedClaims",
            optional=True,
            label="Increased claims",
            kind="textarea",
            section=section,
            spans=(Span("Increased Claims"),),
            inline=False,
            description="Claims that carry the increased liability cap",
        ),
        Field(
            key="unlimitedClaims",
            optional=True,
            label="Unlimited claims",
            kind="textarea",
            section=section,
            spans=(Span("Unlimited Claims"),),
            inline=False,
            description="Claims that are not capped at all",
        ),
    )


def additional_warranties(section: str = KEY_TERMS) -> Field:
    return Field(
        key="additionalWarranties",
        label="Additional warranties",
        kind="textarea",
        section=section,
        spans=(Span("Additional Warranties"),),
        inline=False,
        optional=True,
        description="Any warranties beyond the standard ones, if the parties agreed some",
    )


def dpa_term(section: str = KEY_TERMS) -> Field:
    return Field(
        key="dpa",
        label="Data processing agreement",
        kind="text",
        section=section,
        spans=(Span("DPA"),),
        inline=False,
        optional=True,
        description="The data processing agreement between the parties, if they have one",
    )


def attribution(terms_name: str, version: str = "") -> str:
    """The credit Common Paper's CC BY 4.0 licence asks for."""
    edition = f"{terms_name} Standard Terms"
    if version:
        edition = f"{edition} Version {version}"
    return (
        f"Common Paper {edition}, free to use under CC BY 4.0, "
        "https://creativecommons.org/licenses/by/4.0/."
    )


def notice_address(section: str = KEY_TERMS) -> Field:
    return Field(
        key="noticeAddress",
        label="Notice address",
        kind="textarea",
        section=section,
        spans=(Span("Notice Address"),),
        placeholder="the Notice Address",
        absorbs_article=True,
        description="Where formal notices are sent, e.g. an email or postal address",
    )


def defined_term(key: str, label: str, span: str, description: str, section: str = KEY_TERMS) -> Field:
    """A term the Standard Terms name and the Cover Page defines.

    Its words stay in the prose -- "comply with all License Limits" reads as
    itself, and the value the user gives appears on the cover page.
    """
    return Field(
        key=key,
        label=label,
        kind="textarea",
        section=section,
        spans=(Span(span),),
        inline=False,
        description=description,
    )


def period(key: str, label: str, span: str, description: str, default: str, section: str = KEY_TERMS) -> Field:
    """A length of time that reads naturally in place: "within 30 days"."""
    return Field(
        key=key,
        label=label,
        kind="duration",
        section=section,
        spans=(Span(span),),
        placeholder=f"the {span}",
        absorbs_article=True,
        default=default,
        description=description,
    )
