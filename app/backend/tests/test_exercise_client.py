"""
Unit tests for ExerciseClient._get.

_get is the single HTTP helper all ExerciseClient methods use.
If it breaks, every endpoint that fetches exercise data breaks with it.
"""

from unittest.mock import patch


from services.exercise_client import ExerciseClient


def make_client():
    """
    Build an ExerciseClient without hitting the real API.

    The constructor calls httpx.get to fetch the target muscle list.
    We patch that call so tests never need a live API key or network.
    """
    with patch("services.exercise_client.httpx.get") as mock_get:
        # Return a valid muscle list so __init__ completes cleanly.
        mock_get.return_value.json.return_value = ["biceps", "triceps"]
        return ExerciseClient()


def test_get_returns_rate_limit_dict_on_429():
    """
    When RapidAPI responds with 429 (rate limited), _get must return a
    structured dict instead of crashing — so callers like resolve_exercise
    can detect and handle it gracefully.
    """
    client = make_client()

    with patch("services.exercise_client.httpx.get") as mock_get:
        # Simulate a 429 response from RapidAPI.
        mock_get.return_value.status_code = 429

        result = client._get("https://fake-url.com/exercises")

    assert result == {"error": "rate_limit"}
