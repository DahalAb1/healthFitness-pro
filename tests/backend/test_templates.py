import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add backend to path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../app/backend"))

from template_db import Base
from main import app, get_db

# In-memory SQLite with StaticPool so all sessions share the same connection
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSession = sessionmaker(bind=test_engine)


def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


# -- GET /templates --------------------------------------------------------

def test_list_templates_empty():
    response = client.get("/templates")
    assert response.status_code == 200
    assert response.json() == []


def test_list_templates_returns_created():
    client.post("/templates", json={
        "name": "Push Day",
        "description": "Chest and triceps",
        "exercises": [{"exercise_id": "Bench Press", "target_sets": 4, "target_reps": 10}]
    })

    response = client.get("/templates")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Push Day"


# -- GET /templates/{id} ---------------------------------------------------

def test_get_template_by_id():
    create = client.post("/templates", json={
        "name": "Pull Day",
        "description": "Back and biceps",
        "exercises": [{"exercise_id": "Barbell Row", "target_sets": 4, "target_reps": 8}]
    })
    template_id = create.json()["id"]

    response = client.get(f"/templates/{template_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Pull Day"
    assert len(response.json()["exercises"]) == 1


def test_get_template_not_found():
    response = client.get("/templates/999")
    assert response.status_code == 404


# -- POST /templates -------------------------------------------------------

def test_create_template():
    response = client.post("/templates", json={
        "name": "Leg Day",
        "description": "Quads and glutes",
        "exercises": [
            {"exercise_id": "Barbell Squat", "target_sets": 4, "target_reps": 10},
            {"exercise_id": "Leg Press", "target_sets": 3, "target_reps": 15}
        ]
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Leg Day"
    assert data["description"] == "Quads and glutes"
    assert len(data["exercises"]) == 2


def test_create_template_without_description():
    response = client.post("/templates", json={
        "name": "Quick Workout",
        "exercises": [{"exercise_id": "Push Ups", "target_sets": 3, "target_reps": 20}]
    })
    assert response.status_code == 201
    assert response.json()["description"] is None


def test_create_template_exercises_have_correct_data():
    response = client.post("/templates", json={
        "name": "Test",
        "exercises": [{"exercise_id": "Bicep Curls", "target_sets": 3, "target_reps": 12}]
    })
    ex = response.json()["exercises"][0]
    assert ex["exercise_id"] == "Bicep Curls"
    assert ex["target_sets"] == 3
    assert ex["target_reps"] == 12
