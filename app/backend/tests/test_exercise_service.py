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
