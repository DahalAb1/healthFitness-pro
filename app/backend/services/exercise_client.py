"""HTTP client for the external exercise database (RapidAPI)."""

import httpx
from core.config import settings


class ExerciseClient:
    BASE_URL = "https://exercisedb.p.rapidapi.com"
    HOST = "exercisedb.p.rapidapi.com"

    def __init__(self):
        self.headers = {
            "x-rapidapi-key": settings.XRAPID_API_KEY,
            "x-rapidapi-host": self.HOST,
        }
        result = httpx.get(
            f"{self.BASE_URL}/exercises/targetList", headers=self.headers
        ).json()
        self._target_muscles = set(result) if isinstance(result, list) else set()

    def _get(self, url: str, params: dict = None):
        """HTTP GET with shared headers; surfaces 429 as a structured rate_limit error."""
        response = httpx.get(url, headers=self.headers, params=params)
        if response.status_code == 429:
            return {"error": "rate_limit"}
        return response.json()

    def get_exercises(self, body_part: str = None, limit: int = 10):
        """Fetch exercises from the API, optionally filtered by body part."""
        if body_part in ("biceps", "triceps"):
            url = f"{self.BASE_URL}/exercises/target/{body_part}"
        elif body_part:
            url = f"{self.BASE_URL}/exercises/bodyPart/{body_part}"
        else:
            url = f"{self.BASE_URL}/exercises"
        response = httpx.get(url, headers=self.headers, params={"limit": limit})
        return response.json()

    def get_exercise_by_id(self, exercise_id: str):
        """Fetch a single exercise by its API ID."""
        url = f"{self.BASE_URL}/exercises/exercise/{exercise_id}"
        response = httpx.get(url, headers=self.headers)
        return response.json()

    def find_exercise_by_name(self, exercise_name: str):
        """Search for an exercise by name. Returns the first match or None."""
        url = f"{self.BASE_URL}/exercises/name/{exercise_name}"
        response = httpx.get(url, headers=self.headers)
        results = response.json()
        if isinstance(results, list) and results:
            return results[0]
        return None
