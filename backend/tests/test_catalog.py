def test_catalog_lists_every_agreement_type(client):
    entries = client.get("/api/catalog").json()

    assert len(entries) == 11
    assert {"name", "description", "filename"} == set(entries[0])
    assert "Mutual-NDA.md" in {entry["filename"] for entry in entries}
