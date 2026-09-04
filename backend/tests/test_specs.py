"""Every spec must actually fit the template it describes.

A spec that misses a span, or names one the template does not contain, is the
one way this design fails quietly, so these run over all eleven documents.
"""

import json
import re

import pytest

from app.documents import registry
from app.documents.parser import parse_template

SPECS = list(registry.SPECS.values())
IDS = [spec.doc_type for spec in SPECS]
HEADER_ID = re.compile(r'<span class="header_\d" id="([^"]+)">')


@pytest.fixture(params=SPECS, ids=IDS)
def spec(request):
    return request.param


@pytest.fixture
def raw(spec, templates_dir):
    return (templates_dir / spec.doc_type).read_text(encoding="utf-8")


def numbers(clauses):
    for clause in clauses:
        yield clause.number
        yield from numbers(clause.children)


def test_the_spec_covers_every_span_in_its_template(spec, raw):
    parsed = parse_template(raw, spec)
    assert parsed.clauses


def bodies(clauses):
    """Every clause's prose, however deeply the template nests it."""
    for clause in clauses:
        yield clause.body
        yield from bodies(clause.children)


def test_no_markup_survives(spec, raw):
    """Most of these templates keep their prose in nested clauses, so this
    has to walk the whole tree: a stray tag would otherwise reach a contract."""
    prose = " ".join(bodies(parse_template(raw, spec).clauses))
    assert "<span" not in prose
    assert "</span" not in prose


def test_clause_numbers_match_the_ids_the_template_gives(spec, raw):
    """Numbering is derived from the list markers; where a template also
    states ids, the two must agree."""
    stated = HEADER_ID.findall(raw)
    if not stated:
        pytest.skip(f"{spec.doc_type} carries no id attributes")
    assert stated == [n for n in numbers(parse_template(raw, spec).clauses) if n in set(stated)]


def test_field_keys_are_unique(spec):
    keys = [entry.key for entry in spec.fields]
    assert len(keys) == len(set(keys))


def test_chat_paths_are_unique(spec):
    assert len(spec.paths) == len(set(spec.paths))


def test_every_document_has_two_parties_worth_of_fields(spec):
    assert len([f for f in spec.fields if f.shared.startswith("party")]) == 8


def test_a_duration_field_defaults_to_a_value_and_a_unit(spec):
    for entry in spec.fields:
        if entry.kind == "duration" and entry.default:
            value, unit = entry.default.split()
            assert value.isdigit() and unit in ("days", "months", "years")


def test_every_catalog_entry_can_be_drafted(templates_dir):
    catalog = json.loads((templates_dir.parent / "catalog.json").read_text(encoding="utf-8"))
    assert {entry["filename"] for entry in catalog} == set(registry.SPECS)


def test_spec_names_match_the_catalog(templates_dir):
    catalog = json.loads((templates_dir.parent / "catalog.json").read_text(encoding="utf-8"))
    names = {entry["filename"]: entry["name"] for entry in catalog}
    assert {k: v.name for k, v in registry.SPECS.items()} == names
