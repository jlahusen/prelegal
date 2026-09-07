"""A placeholder that carries its own article must sit where an article was absorbed.

"the applicable an Uptime Credit" is what happens when a field absorbs an
article the template never put directly in front of it.
"""

import re

import pytest

from app.documents import registry
from app.documents.parser import parse_template

SPECS = list(registry.SPECS.values())


def bodies(clauses):
    for clause in clauses:
        yield clause.body
        yield from bodies(clause.children)


@pytest.mark.parametrize("spec", SPECS, ids=[spec.doc_type for spec in SPECS])
def test_no_placeholder_follows_a_stray_article(spec, templates_dir):
    raw = (templates_dir / spec.doc_type).read_text(encoding="utf-8")
    articled = [f.key for f in spec.fields if f.placeholder.split(" ")[0] in ("a", "an", "the")]
    for body in bodies(parse_template(raw, spec).clauses):
        for key in articled:
            stray = re.search(r"\b(the|an?|applicable) \{\{" + re.escape(key) + r"\}\}", body)
            assert stray is None, f"{spec.doc_type}: {stray.group(0)!r}"
