"""
Unit tests for ExerciseClient._get.

_get is the single HTTP helper all ExerciseClient methods use.
If it breaks, every endpoint that fetches exercise data breaks with it.
"""

from unittest.mock import MagicMock, patch


def make_client():
    """
    Build an ExerciseClient without hitting the real API.

    The constructor calls httpx.get to fetch the target muscle list.
    We patch that call so tests never need a live API key or network.
    """
    with patch("services.exercise_client.httpx.get") as mock_get:
        # Return a valid muscle list so __init__ completes cleanly.
        mock_get.return_value.json.return_value = ["biceps", "triceps"]
        from services.exercise_client import ExerciseClient
        return ExerciseClient()
