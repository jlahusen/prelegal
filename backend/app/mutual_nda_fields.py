"""The fields of a Mutual NDA, as dotted paths into the client's form data.

The descriptions are what the model is told each field means, so this is the
one place the agreement's field spec is written down.
"""

from typing import Literal

FIELDS: dict[str, str] = {
    "partyA.name": "Legal name of the first party, e.g. 'Acme, Inc.'",
    "partyA.address": "Postal address of the first party",
    "partyA.signatoryName": "Name of the person signing for the first party",
    "partyA.signatoryTitle": "Job title of that signatory, e.g. 'CEO'",
    "partyB.name": "Legal name of the second party",
    "partyB.address": "Postal address of the second party",
    "partyB.signatoryName": "Name of the person signing for the second party",
    "partyB.signatoryTitle": "Job title of that signatory",
    "purpose": (
        "Why information is being shared. Completes the clause "
        "'...in connection with the ___', so it must be a noun phrase, e.g. "
        "'evaluation of a potential business partnership between the parties'"
    ),
    "effectiveDate": "Date the agreement starts, as yyyy-mm-dd",
    "mndaTermValue": "How long the agreement stays active, as a whole number",
    "mndaTermUnit": "Unit for the agreement's term: days, months or years",
    "confidentialityPerpetual": (
        "'true' if confidentiality obligations last forever, otherwise 'false'"
    ),
    "confidentialityTermValue": (
        "How long confidentiality lasts after the agreement ends, as a whole "
        "number. Ignored when confidentialityPerpetual is true"
    ),
    "confidentialityTermUnit": "Unit for the confidentiality term",
    "governingLaw": "US state whose law governs, e.g. 'Delaware'",
    "jurisdiction": "Where the courts sit, e.g. 'San Francisco, California'",
}

FIELD_PATHS = tuple(FIELDS)

FieldPath = Literal[FIELD_PATHS]
