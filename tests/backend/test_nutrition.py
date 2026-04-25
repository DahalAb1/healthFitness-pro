import os
import sys
from datetime import date

sys.path.insert(0, os.path.abspath("."))
sys.path.insert(0, os.path.abspath("app/backend"))

from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool

from app.backend.main import app
from api.deps import get_current_user, get_session
from models.nutrition import MealLog
from models.user import User
from api.routes import nutrition

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


def override_get_session():
    with Session(engine) as session:
        yield session


def override_get_current_user():
    return User(
        id=1,
        email="test@example.com",
        hashed_password="fakehashedpassword",
    )


app.dependency_overrides[get_session] = override_get_session
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)


def setup_function():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)


def test_search_foods_returns_nutrition_results(monkeypatch):
    mock_results = [
        {
            "food_id": "123",
            "food_name": "Banana",
            "kcal": 105,
            "serving_description": "1 medium banana",
        }
    ]

    def mock_search_foods(query: str, page: int, max_results: int):
        assert query == "banana"
        assert page == 0
        assert max_results == 20
        return mock_results

    monkeypatch.setattr(nutrition.client, "search_foods", mock_search_foods)

    response = client.get("/nutrition/search?q=banana&page=0&max_results=20")

    assert response.status_code == 200
    data = response.json()
    assert data == mock_results
    assert data[0]["food_name"] == "Banana"
    assert data[0]["kcal"] == 105


def test_add_meal_log_creates_entry():
    payload = {
        "log_date": "2026-04-24",
        "meal_type": "breakfast",
        "food_name": "Greek Yogurt",
        "kcal": 130,
        "protein_g": 15,
        "carbs_g": 8,
        "fat_g": 3,
    }

    response = client.post("/nutrition/logs", json=payload)

    assert response.status_code == 201
    data = response.json()

    assert data["id"] is not None
    assert data["log_date"] == "2026-04-24"
    assert data["meal_type"] == "breakfast"
    assert data["food_name"] == "Greek Yogurt"
    assert data["kcal"] == 130
    assert data["protein_g"] == 15
    assert data["carbs_g"] == 8
    assert data["fat_g"] == 3


def test_nutrition_trends_returns_daily_macro_totals():
    with Session(engine) as session:
        session.add(
            MealLog(
                user_id=1,
                log_date=date(2026, 4, 24),
                meal_type="breakfast",
                food_name="Eggs",
                kcal=200,
                protein_g=12,
                carbs_g=2,
                fat_g=14,
            )
        )
        session.add(
            MealLog(
                user_id=1,
                log_date=date(2026, 4, 24),
                meal_type="lunch",
                food_name="Chicken Rice Bowl",
                kcal=500,
                protein_g=35,
                carbs_g=55,
                fat_g=10,
            )
        )
        session.commit()

    response = client.get("/nutrition/logs/trends")

    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    assert data[0]["date"] == "2026-04-24"
    assert data[0]["kcal"] == 700
    assert data[0]["protein_g"] == 47
    assert data[0]["carbs_g"] == 57
    assert data[0]["fat_g"] == 24