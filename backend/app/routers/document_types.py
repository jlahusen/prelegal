"""The fields and clauses of each agreement the product can draft.

Templates are parsed once at startup: they are read-only files that only
change when the repository does.
"""

from pathlib import Path

from fastapi import APIRouter, HTTPException, Request, status

from app.documents import registry
from app.documents.parser import Clause, ParsedTemplate, parse_template
from app.documents.spec import DocumentSpec
from app.schemas import ClauseOut, DocumentTypeOut, FieldOut

router = APIRouter(prefix="/document-types", tags=["document-types"])


def _clause(clause: Clause) -> ClauseOut:
    return ClauseOut(
        number=clause.number,
        title=clause.title,
        body=clause.body,
        children=[_clause(child) for child in clause.children],
    )


def _document(spec: DocumentSpec, parsed: ParsedTemplate) -> DocumentTypeOut:
    return DocumentTypeOut(
        doc_type=spec.doc_type,
        name=spec.name,
        intro=spec.intro,
        attribution=spec.attribution,
        sections=list(spec.sections),
        fields=[
            FieldOut(
                key=entry.key,
                label=entry.label,
                kind=entry.kind,
                section=entry.section,
                placeholder=entry.placeholder or entry.label,
                default=entry.default,
                shared=entry.shared,
                inline=entry.inline,
                optional=entry.optional,
                required_unless=entry.required_unless,
            )
            for entry in spec.fields
        ],
        clauses=[_clause(clause) for clause in parsed.clauses],
    )


def load_documents(templates_dir: Path) -> dict[str, DocumentTypeOut]:
    """Parse every template against its spec. Called once at startup."""
    return {
        doc_type: _document(spec, parse_template(
            (templates_dir / doc_type).read_text(encoding="utf-8"), spec
        ))
        for doc_type, spec in registry.SPECS.items()
    }


@router.get("/{doc_type}")
def read_document_type(doc_type: str, request: Request) -> DocumentTypeOut:
    documents = request.app.state.documents
    if doc_type not in documents:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Cannot draft {doc_type}")
    return documents[doc_type]
