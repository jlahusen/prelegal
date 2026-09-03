def test_create_returns_stored_draft(client, draft):
    response = client.post("/api/documents", json=draft)

    assert response.status_code == 201
    document = response.json()
    assert document["id"]
    assert document["title"] == draft["title"]
    assert document["data"] == draft["data"]
    assert document["created_at"] == document["updated_at"]


def test_draft_round_trips_through_the_database(client, draft):
    document_id = client.post("/api/documents", json=draft).json()["id"]

    document = client.get(f"/api/documents/{document_id}").json()

    assert document["data"] == draft["data"]


def test_list_summarises_drafts_without_field_data(client, draft):
    client.post("/api/documents", json=draft)

    summaries = client.get("/api/documents").json()

    assert len(summaries) == 1
    assert "data" not in summaries[0]
    assert summaries[0]["title"] == draft["title"]


def test_update_replaces_field_data(client, draft):
    document_id = client.post("/api/documents", json=draft).json()["id"]

    updated = client.put(
        f"/api/documents/{document_id}",
        json={**draft, "title": "Acme / Initech NDA", "data": {"purpose": "Pilot"}},
    ).json()

    assert updated["title"] == "Acme / Initech NDA"
    assert updated["data"] == {"purpose": "Pilot"}
    assert updated["updated_at"] >= updated["created_at"]


def test_delete_removes_the_draft(client, draft):
    document_id = client.post("/api/documents", json=draft).json()["id"]

    assert client.delete(f"/api/documents/{document_id}").status_code == 204
    assert client.get(f"/api/documents/{document_id}").status_code == 404


def test_unknown_id_is_a_404(client):
    assert client.get("/api/documents/does-not-exist").status_code == 404
    assert client.delete("/api/documents/does-not-exist").status_code == 404
    assert client.put("/api/documents/does-not-exist", json={}).status_code == 422


def test_title_and_type_are_required(client):
    assert client.post("/api/documents", json={"doc_type": "", "title": ""}).status_code == 422
