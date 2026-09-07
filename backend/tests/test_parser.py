"""The parser turns a template into clauses without changing a word of it.

The Mutual NDA is the baseline: its clauses were transcribed by hand before
the parser existed, so parsing the same template must reproduce them.
"""

import pytest

from app.documents.mutual_nda import SPEC
from app.documents.parser import parse_template
from app.documents.spec import DocumentSpec, Field, Override, Span

TEMPLATE = "templates/Mutual-NDA.md"


def clause(parsed, number):
    return next(c for c in parsed.clauses if c.number == number)


@pytest.fixture
def nda(templates_dir):
    return parse_template((templates_dir / "Mutual-NDA.md").read_text(encoding="utf-8"), SPEC)


def test_every_numbered_clause_is_found(nda):
    assert nda.title == "Standard Terms"
    assert [c.number for c in nda.clauses] == [str(n) for n in range(1, 12)]
    assert clause(nda, "9").title == "Governing Law and Jurisdiction"


def test_no_span_markup_survives_parsing(nda):
    assert not any("<span" in c.body for c in nda.clauses)


def test_a_field_becomes_a_token(nda):
    assert "in connection with the {{purpose}} which" in clause(nda, "1").body


def test_a_field_that_absorbs_its_article_drops_it(nda):
    """"commences on the Effective Date" must not become "on the 1 May 2026"."""
    body = clause(nda, "5").body
    assert body.startswith("This MNDA commences on {{effectiveDate}} and expires at the end of {{mndaTerm}}.")
    assert "will survive for {{confidentialityTerm}}, despite" in body


def test_a_repeated_term_reads_as_words_not_a_second_value(nda):
    """Substituting twice would read "provisions of such Delaware"."""
    body = clause(nda, "9").body
    assert "the laws of the State of {{governingLaw}}, without regard to" in body
    assert "conflict of laws provisions of such State." in body
    assert "courts located in {{jurisdiction}}." in body
    assert "exclusive jurisdiction of such courts in any such suit" in body


def test_the_closing_attribution_is_not_part_of_the_last_clause(nda):
    assert "CC BY 4.0" not in clause(nda, "11").body


def test_a_span_the_spec_does_not_cover_stops_the_parse():
    bare = DocumentSpec(doc_type="X.md", name="X", fields=(), attribution="")
    with pytest.raises(KeyError, match="Surprise"):
        parse_template('1. <span class="keyterms_link">Surprise</span>', bare)


def test_an_override_only_fires_on_the_occurrence_it_names():
    spec = DocumentSpec(
        doc_type="X.md",
        name="X",
        attribution="",
        fields=(Field(key="law", label="Law", kind="text", section="s",
                      description="d", spans=(Span("Law"),)),),
        overrides=(Override("Law", 2, "State"),),
    )
    raw = '1. of <span class="keyterms_link">Law</span> and such <span class="keyterms_link">Law</span>'
    assert parse_template(raw, spec).clauses[0].body == "of {{law}} and such State"


def spec_for(span_text, key="term"):
    return DocumentSpec(
        doc_type="X.md",
        name="X",
        attribution="",
        fields=(Field(key=key, label="Term", kind="text", section="s",
                      description="d", spans=(Span(span_text),)),),
    )


def test_a_fill_in_span_is_still_found_when_it_carries_an_id():
    """SLA and CSA give some of their spans an id; they are fields all the same."""
    raw = '1. For <span class="orderform_link" id="3.2.a">Uptime Credit</span> we pay'
    parsed = parse_template(raw, spec_for("Uptime Credit"))
    assert parsed.clauses[0].body == "For {{term}} we pay"


def test_an_anchor_keeps_the_words_it_wraps():
    """<span id="5.3.a">if</span> is a link target, not a fill-in point."""
    raw = '1. <span id="5.3.a">if</span> the other party fails'
    parsed = parse_template(raw, DocumentSpec(doc_type="X.md", name="X", fields=(), attribution=""))
    assert parsed.clauses[0].body == "if the other party fails"


def test_an_anchor_closed_twice_leaves_nothing_behind():
    """CSA's definition of "Variable" has a doubled closing tag."""
    raw = '1. <span id="13.34">**"Variable"**</span></span> means a word'
    parsed = parse_template(raw, DocumentSpec(doc_type="X.md", name="X", fields=(), attribution=""))
    assert parsed.clauses[0].body == '**"Variable"** means a word'


def test_a_capitalised_article_is_absorbed_too():
    """Six templates open a clause "The Governing Law will govern"."""
    spec = DocumentSpec(
        doc_type="X.md", name="X", attribution="",
        fields=(Field(key="law", label="Law", kind="text", section="s", description="d",
                      spans=(Span("Governing Law"),), absorbs_article=True),),
    )
    raw = '1. The <span class="keyterms_link">Governing Law</span> will govern this Agreement.'
    assert parse_template(raw, spec).clauses[0].body == "{{law}} will govern this Agreement."


def test_markdown_links_read_as_prose():
    bare = DocumentSpec(doc_type="X.md", name="X", fields=(), attribution="")
    raw = "1. posted at <https://commonpaper.com/x/> and [the standard](https://commonpaper.com/y)"
    body = parse_template(raw, bare).clauses[0].body
    assert body == "posted at https://commonpaper.com/x/ and the standard"
