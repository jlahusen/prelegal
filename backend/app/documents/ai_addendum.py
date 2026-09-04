"""AI Addendum, supplementing an existing agreement."""

from app.documents import common
from app.documents.spec import DocumentSpec, Field, Span, party

TERMS = "AI terms"


def _restriction(key: str, label: str, span: str, description: str) -> Field:
    """These are all defined terms the Cover Page sets out, so they stay as words."""
    return Field(
        key=key,
        label=label,
        kind="textarea",
        section=TERMS,
        spans=(Span(span),),
        inline=False,
        description=description,
    )


SPEC = DocumentSpec(
    doc_type="AI-Addendum.md",
    name="AI Addendum",
    intro=(
        "This Cover Page incorporates by reference the Standard Terms below "
        "and supplements the parties' existing agreement."
    ),
    attribution=common.attribution("AI Addendum", "1.0"),
    fields=(
        *party("customer", "Customer", 1, role_word="Customer"),
        *party("provider", "Provider", 2, role_word="Provider"),
        _restriction(
            "trainingData", "Training data", "Training Data",
            "Data the provider may train models on, if any",
        ),
        _restriction(
            "trainingPurposes", "Training purposes", "Training Purposes",
            "What the provider may train models for",
        ),
        _restriction(
            "trainingRestrictions", "Training restrictions", "Training Restrictions",
            "Limits on how the provider may train models",
        ),
        _restriction(
            "improvementRestrictions", "Improvement restrictions", "Improvement Restrictions",
            "Limits on using inputs and outputs to improve the product without training",
        ),
    ),
)
