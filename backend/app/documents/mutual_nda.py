"""Mutual Non-Disclosure Agreement."""

from app.documents.spec import DocumentSpec, Field, Override, Span, party

SPEC = DocumentSpec(
    doc_type="Mutual-NDA.md",
    name="Mutual Non-Disclosure Agreement",
    intro=(
        "This Cover Page incorporates by reference the Standard Terms below "
        "to form the parties' MNDA."
    ),
    attribution=(
        "Common Paper Mutual Non-Disclosure Agreement Version 1.0, "
        "https://commonpaper.com/standards/mutual-nda/1.0/, free to use under "
        "CC BY 4.0, https://creativecommons.org/licenses/by/4.0/."
    ),
    fields=(
        *party("partyA", "Party 1", 1),
        *party("partyB", "Party 2", 2),
        Field(
            key="purpose",
            label="Purpose",
            kind="textarea",
            section="Agreement terms",
            spans=(Span("Purpose"),),
            placeholder="Purpose",
            description=(
                "Why information is being shared. Completes the clause "
                "'...in connection with the ___', so it must be a noun phrase, "
                "e.g. 'evaluation of a potential business partnership between "
                "the parties'"
            ),
        ),
        Field(
            key="effectiveDate",
            label="Effective date",
            kind="date",
            section="Agreement terms",
            spans=(Span("Effective Date"),),
            placeholder="the Effective Date",
            absorbs_article=True,
            shared="effectiveDate",
            description="Date the agreement starts, as yyyy-mm-dd",
        ),
        Field(
            key="mndaTerm",
            label="MNDA term",
            kind="duration",
            section="Agreement terms",
            spans=(Span("MNDA Term"),),
            placeholder="the MNDA Term",
            absorbs_article=True,
            default="2 years",
            description="How long the agreement stays active",
        ),
        Field(
            key="confidentialityPerpetual",
            label="Confidentiality lasts in perpetuity",
            kind="boolean",
            section="Agreement terms",
            default="false",
            description=(
                "'true' if confidentiality obligations last forever, otherwise "
                "'false'"
            ),
        ),
        Field(
            key="confidentialityTerm",
            label="Term of confidentiality",
            kind="duration",
            section="Agreement terms",
            spans=(Span("Term of Confidentiality"),),
            placeholder="the Term of Confidentiality",
            absorbs_article=True,
            default="3 years",
            required_unless=("confidentialityPerpetual", "true"),
            description=(
                "How long confidentiality lasts after the agreement ends. "
                "Ignored when confidentialityPerpetual is true"
            ),
        ),
        Field(
            key="governingLaw",
            label="Governing law",
            kind="text",
            section="Agreement terms",
            spans=(Span("Governing Law"),),
            placeholder="Governing Law",
            shared="governingLaw",
            description="US state whose law governs, e.g. 'Delaware'",
        ),
        Field(
            key="jurisdiction",
            label="Jurisdiction",
            kind="text",
            section="Agreement terms",
            spans=(Span("Jurisdiction"),),
            placeholder="the Jurisdiction",
            shared="jurisdiction",
            description="Where the courts sit, e.g. 'San Francisco, California'",
        ),
    ),
    overrides=(
        Override("Governing Law", 2, "State"),
        Override("Jurisdiction", 2, "courts"),
    ),
)
