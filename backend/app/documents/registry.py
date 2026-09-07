"""Every document type the product can draft, keyed by its template filename.

Adding an agreement means writing one spec module and listing it here.
"""

from app.documents import (
    ai_addendum,
    baa,
    csa,
    design_partner,
    dpa,
    mutual_nda,
    partnership,
    pilot,
    psa,
    sla,
    software_license,
)
from app.documents.spec import DocumentSpec

MODULES = (
    mutual_nda,
    csa,
    design_partner,
    sla,
    psa,
    dpa,
    software_license,
    partnership,
    baa,
    pilot,
    ai_addendum,
)

SPECS: dict[str, DocumentSpec] = {module.SPEC.doc_type: module.SPEC for module in MODULES}


def get(doc_type: str) -> DocumentSpec:
    """The spec for a document type. Raises KeyError if we cannot draft it."""
    return SPECS[doc_type]
