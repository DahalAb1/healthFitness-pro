"""
Unit tests for the exercise routes in api/routes/exercises.py.

The routes are responsible for translating service-layer results into
correct HTTP status codes. A rate-limit error must become a 503 —
if it becomes a 500 or 502 instead, the frontend's error handling breaks
because it checks specifically for 503 to show the rate-limit message.
"""

from unittest.mock import patch
from fastapi import FastAPI
from fastapi.testclient import TestClient

# Patch httpx.get before importing the exercises router.
# The router creates an ExerciseClient at module level, which calls the real
# API in __init__. This patch intercepts that call so no network request is made.
with patch("services.exercise_client.httpx.get") as _mock:
    _mock.return_value.json.return_value = ["biceps", "triceps"]
    from api.routes.exercises import router

# Minimal FastAPI app — only the exercises router, no DB or middleware needed.
app = FastAPI()
app.include_router(router)
test_client = TestClient(app)


def test_rate_limited_exercise_returns_503():
    """
    When resolve_exercise returns a rate-limit error, the route must respond
    with HTTP 503. The frontend checks for 503 specifically to show the
    rate-limit message — any other status code silently breaks that behavior.
    """
    # Patch resolve_exercise inside the routes module so the route uses our
    # controlled return value instead of calling the real ExerciseClient.
    with patch("api.routes.exercises.resolve_exercise") as mock_resolve:
        mock_resolve.return_value = {"error": "rate_limit"}
        response = test_client.get("/exercises/bench-press")

    assert response.status_code == 503
