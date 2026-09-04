"""Data Processing Agreement, supplementing an existing agreement."""

from app.documents import common
from app.documents.spec import DocumentSpec, Field, Span, party

ANNEX = "Processing details"
SECURITY = "Security"

SPEC = DocumentSpec(
    doc_type="DPA.md",
    name="Data Processing Agreement",
    intro=(
        "This Cover Page incorporates by reference the Standard Terms below "
        "and supplements the parties' Agreement."
    ),
    attribution=common.attribution("Data Processing Agreement"),
    fields=(
        *party("customer", "Customer", 1, role_word="Customer"),
        *party("provider", "Provider", 2, role_word="Provider"),
        Field(
            key="agreement",
            label="Underlying agreement",
            kind="text",
            section=ANNEX,
            spans=(Span("Agreement"),),
            placeholder="Agreement",
            description="The agreement this DPA attaches to, e.g. 'Cloud Service Agreement'",
        ),
        common.defined_term("categoriesOfPersonalData", "Categories of personal data",
                            "Categories of Personal Data",
                            "Kinds of personal data processed, e.g. 'names, email addresses'", ANNEX),
        common.defined_term("categoriesOfDataSubjects", "Categories of data subjects",
                            "Categories of Data Subjects",
                            "Whose personal data is processed, e.g. 'the customer's employees'", ANNEX),
        common.defined_term("specialCategoryData", "Special category data", "Special Category Data",
                            "Sensitive data processed, if any", ANNEX),
        common.defined_term("specialCategoryDataSafeguards", "Special category data safeguards",
                            "Special Category Data Restrictions or Safeguards",
                            "Extra restrictions or safeguards for sensitive data", ANNEX),
        common.defined_term("frequencyOfTransfer", "Frequency of transfer", "Frequency of Transfer",
                            "How often data is transferred, e.g. 'continuous'", ANNEX),
        common.defined_term("natureAndPurposeOfProcessing", "Nature and purpose of processing",
                            "Nature and Purpose of Processing",
                            "What the processing is for", ANNEX),
        common.defined_term("durationOfProcessing", "Duration of processing", "Duration of Processing",
                            "How long the data is processed for", ANNEX),
        common.defined_term("approvedSubprocessors", "Approved subprocessors", "Approved Subprocessors",
                            "Subprocessors the customer has approved", ANNEX),
        Field(
            key="governingMemberState",
            label="Governing member state",
            kind="text",
            section=ANNEX,
            spans=(Span("Governing Member State"),),
            placeholder="Governing Member State",
            description="EEA member state whose law governs the standard contractual clauses, e.g. 'Ireland'",
        ),
        common.defined_term("securityPolicy", "Security policy", "Security Policy",
                            "The provider's security standards", SECURITY),
        Field(
            key="providerSecurityContact",
            label="Provider security contact",
            kind="text",
            section=SECURITY,
            spans=(Span("Provider Security Contact"),),
            placeholder="the Provider Security Contact",
            absorbs_article=True,
            description="Where security requests are sent, e.g. 'security@acme.com'",
        ),
    ),
)
