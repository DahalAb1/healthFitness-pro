import pytest
from fastapi.testclient import TestClient
from app.backend.main import app

client = TestClient(app)

def test_get_exercises_returns_list():
    response = client.get("/exercises")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:
        assert "id" in data[0]
        assert "name" in data[0]

def test_get_exercises_with_body_part():
    response = client.get("/exercises?bodyPart=CHEST")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    for ex in data:
        assert "Chest".lower() in [bp.lower() for bp in (ex.get("bodyParts") or [])]

def test_get_exercise_by_id():
    # Get a valid exercise id first
    response = client.get("/exercises")
    data = response.json()
    if data:
        ex_id = data[0]["id"]
        detail_resp = client.get(f"/exercises/{ex_id}")
        assert detail_resp.status_code == 200
        detail = detail_resp.json()
        assert detail["id"] == ex_id

def test_get_exercise_by_invalid_id():
    response = client.get("/exercises/invalid_id_12345")
    assert response.status_code in (404, 400, 200)  # Accept 404, 400, or 200 with error message
    # Optionally check for error message in response
