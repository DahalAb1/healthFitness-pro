import os
import sys

sys.path.insert(0, os.path.abspath("."))
sys.path.insert(0, os.path.abspath("app/backend"))

from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool

from app.backend.main import app
from api.deps import get_current_user, get_session
from models.user import User

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


def override_get_session():
    with Session(engine) as session:
        yield session


_current_user_id = {"value": 1}


def override_get_current_user():
    return User(
        id=_current_user_id["value"],
        email=f"user{_current_user_id['value']}@example.com",
        hashed_password="fakehashedpassword",
    )


app.dependency_overrides[get_session] = override_get_session
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)


def setup_function():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    _current_user_id["value"] = 1
    app.dependency_overrides[get_session] = override_get_session
    app.dependency_overrides[get_current_user] = override_get_current_user


def make_payload(name: str = "Push Day"):
    return {
        "name": name,
        "main_muscle": "Chest",
        "difficulty": "Intermediate",
        "duration_minutes": 45,
        "exercises": [
            {
                "exercise_id": "1",
                "exercise_name": "Bench Press",
                "sets": 4,
                "reps": 8,
                "weight": 135,
            },
            {
                "exercise_id": "2",
                "exercise_name": "Incline Dumbbell Press",
                "sets": 3,
                "reps": 10,
                "weight": 60,
            },
        ],
    }


def test_create_custom_workout_saves_user_owned_template():
    response = client.post("/user-workouts", json=make_payload("My Custom Workout"))

    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["user_id"] == 1
    assert data["name"] == "My Custom Workout"


def test_create_custom_workout_persists_nested_exercise_payload_correctly():
    response = client.post("/user-workouts", json=make_payload("Nested Payload Test"))

    assert response.status_code == 201
    data = response.json()
    assert len(data["exercises"]) == 2
    assert data["exercises"][0]["exercise_name"] == "Bench Press"
    assert data["exercises"][0]["sets"] == 4
    assert data["exercises"][0]["reps"] == 8
    assert data["exercises"][1]["exercise_name"] == "Incline Dumbbell Press"


def test_get_custom_workouts_returns_only_current_users_workouts():
    _current_user_id["value"] = 1
    client.post("/user-workouts", json=make_payload("User One Workout"))

    _current_user_id["value"] = 2
    client.post("/user-workouts", json=make_payload("User Two Workout"))

    _current_user_id["value"] = 1
    response = client.get("/user-workouts")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "User One Workout"
    assert data[0]["user_id"] == 1


def test_get_custom_workouts_returns_empty_list_when_user_has_none():
    response = client.get("/user-workouts")

    assert response.status_code == 200
    assert response.json() == []


def test_delete_custom_workout_succeeds_for_owner():
    create_response = client.post("/user-workouts", json=make_payload("Delete Me"))
    workout_id = create_response.json()["id"]

    delete_response = client.delete(f"/user-workouts/{workout_id}")

    assert delete_response.status_code == 200
    assert delete_response.json() == {"deleted": True, "id": workout_id}

    list_response = client.get("/user-workouts")
    assert list_response.status_code == 200
    assert list_response.json() == []


def test_delete_custom_workout_returns_404_when_workout_does_not_exist():
    response = client.delete("/user-workouts/99999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Workout not found"


def test_delete_custom_workout_returns_404_when_workout_belongs_to_another_user():
    _current_user_id["value"] = 1
    create_response = client.post("/user-workouts", json=make_payload("Owner Workout"))
    workout_id = create_response.json()["id"]

    _current_user_id["value"] = 2
    delete_response = client.delete(f"/user-workouts/{workout_id}")

    assert delete_response.status_code == 404
    assert delete_response.json()["detail"] == "Workout not found"

    _current_user_id["value"] = 1
    list_response = client.get("/user-workouts")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1
    assert list_response.json()[0]["id"] == workout_id


def test_create_and_list_sequence_verifies_consistency():
    create_response = client.post("/user-workouts", json=make_payload("Round Trip Workout"))
    created = create_response.json()

    list_response = client.get("/user-workouts")

    assert create_response.status_code == 201
    assert list_response.status_code == 200
    data = list_response.json()
    assert len(data) == 1
    assert data[0]["id"] == created["id"]
    assert data[0]["name"] == "Round Trip Workout"
    assert data[0]["exercises"][0]["exercise_name"] == "Bench Press"


def test_unauthorized_request_to_custom_workout_routes_is_rejected():
    app.dependency_overrides.pop(get_current_user, None)

    try:
        post_response = client.post("/user-workouts", json=make_payload("No Auth"))
        get_response = client.get("/user-workouts")
        delete_response = client.delete("/user-workouts/1")

        assert post_response.status_code == 401
        assert get_response.status_code == 401
        assert delete_response.status_code == 401
    finally:
        app.dependency_overrides[get_current_user] = override_get_current_user


def test_create_custom_workout_validates_required_fields():
    invalid_payload = {
        "name": "Invalid Workout Missing Exercises",
        # exercises intentionally missing
    }

    response = client.post("/user-workouts", json=invalid_payload)

    assert response.status_code == 422

    list_response = client.get("/user-workouts")
    assert list_response.status_code == 200
    assert list_response.json() == []
