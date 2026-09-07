"""The endpoint that tells the client how to draw and fill one agreement."""

import pytest

from app.documents import registry


@pytest.fixture
def nda(client):
    return client.get("/api/document-types/Mutual-NDA.md").json()


def test_every_catalog_entry_is_served(client):
    for doc_type in registry.SPECS:
        assert client.get(f"/api/document-types/{doc_type}").status_code == 200


def test_an_agreement_we_cannot_draft_is_a_404(client):
    assert client.get("/api/document-types/Lease.md").status_code == 404


def test_the_document_carries_its_fields_and_its_clauses(nda):
    assert nda["name"] == "Mutual Non-Disclosure Agreement"
    assert nda["sections"] == ["Party 1", "Party 2", "Agreement terms"]
    assert len(nda["clauses"]) == 11
    keys = [field["key"] for field in nda["fields"]]
    assert "partyA.name" in keys and "governingLaw" in keys


def test_a_field_says_how_to_draw_it(nda):
    fields = {field["key"]: field for field in nda["fields"]}
    assert fields["effectiveDate"]["kind"] == "date"
    assert fields["mndaTerm"]["kind"] == "duration"
    assert fields["mndaTerm"]["default"] == "2 years"
    assert fields["purpose"]["kind"] == "textarea"
    assert fields["confidentialityTerm"]["required_unless"] == ["confidentialityPerpetual", "true"]


def test_clause_bodies_carry_tokens_not_markup(nda):
    bodies = " ".join(clause["body"] for clause in nda["clauses"])
    assert "{{purpose}}" in bodies
    assert "<span" not in bodies


def test_nested_clauses_come_back_nested(client):
    csa = client.get("/api/document-types/CSA.md").json()
    first = csa["clauses"][0]
    assert first["number"] == "1"
    assert [child["number"] for child in first["children"]][:2] == ["1.1", "1.2"]


def test_the_model_facing_descriptions_are_not_shipped_to_the_browser(nda):
    assert "description" not in nda["fields"][0]
