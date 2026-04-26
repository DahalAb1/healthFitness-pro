"""
Unit tests for resolve_exercise in exercise_service.py.

resolve_exercise is the lookup layer between the routes and ExerciseClient.
It tries to find an exercise by ID first, then falls back to name search.
If either call comes back rate-limited, it must stop immediately and return
the error — making an extra API call while already rate-limited would be wasteful.
"""

from unittest.mock import MagicMock
from services.exercise_service import resolve_exercise


def make_mock_client():
    """
    Build a fake ExerciseClient using MagicMock.

    This lets each test control exactly what get_exercise_by_id and
    find_exercise_by_name return without touching the real API.
    """
    return MagicMock()


def test_resolve_exercise_short_circuits_on_rate_limit():
    """
    When the ID lookup is rate-limited, resolve_exercise must return
    {"error": "rate_limit"} immediately without calling find_exercise_by_name.

    Without this check, the code would make a second API call while already
    rate-limited — burning a request and returning the wrong result.
    """
    client = make_mock_client()

    # Simulate the ID lookup being rate-limited.
    client.get_exercise_by_id.return_value = {"error": "rate_limit"}

    result = resolve_exercise(client, "bench-press")

    assert result == {"error": "rate_limit"}
    # The name fallback must never be called when the ID lookup is rate-limited.
    client.find_exercise_by_name.assert_not_called()
