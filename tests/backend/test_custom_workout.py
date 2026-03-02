import os
import sqlite3
import pytest
from fastapi.testclient import TestClient
from app.backend.main import app

client = TestClient(app)

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'app', 'backend', 'user_workouts.db')

def clear_workouts_table():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('DELETE FROM workouts')
    conn.commit()
    conn.close()

@pytest.fixture(autouse=True)
def run_before_and_after_tests():
    # Setup: clear workouts before each test
    clear_workouts_table()
    yield
    # Optionally clear again after each test
    clear_workouts_table()

# Helper for creating a user workout payload
def make_user_workout(name="Test Workout", user_id=1, exercises=None):
    if exercises is None:
        exercises = [
            {"exercise_id": "1", "exercise_name": "Push Up", "sets": 3, "reps": 10}
        ]
    # Only include fields allowed by UserWorkoutCreate and CustomWorkoutExercise
    return {
        "user_id": user_id,
        "name": name,
        "creator_notes": "Unit test note",
        "exercises": exercises
    }

def test_create_user_workout():
    payload = make_user_workout()
    response = client.post("/user-workouts", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["user_id"] == payload["user_id"]
    assert isinstance(data["exercises"], list)
    assert data["exercises"][0]["exercise_name"] == "Push Up"

def test_get_user_workouts():
    # Create a workout to ensure at least one exists
    payload = make_user_workout(name="Workout for get")
    client.post("/user-workouts", json=payload)
    response = client.get("/user-workouts?user_id=1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(w["name"] == "Workout for get" for w in data)

def test_delete_user_workout():
    # Create a workout to delete
    payload = make_user_workout(name="Workout to delete")
    create_resp = client.post("/user-workouts", json=payload)
    workout_id = create_resp.json()["id"]
    del_resp = client.delete(f"/user-workouts/{workout_id}?user_id=1")
    assert del_resp.status_code == 200
    del_data = del_resp.json()
    assert del_data["deleted"] is True
    # Confirm it's gone
    get_resp = client.get("/user-workouts?user_id=1")
    assert all(w["id"] != workout_id for w in get_resp.json())

def test_create_user_workout_max_limit():
    # Create more than MAX_USER_WORKOUTS (10) for user 2
    for i in range(12):
        payload = make_user_workout(name=f"Workout {i}", user_id=2)
        client.post("/user-workouts", json=payload)
    response = client.get("/user-workouts?user_id=2")
    data = response.json()
    assert len(data) <= 10  # Should not exceed max
