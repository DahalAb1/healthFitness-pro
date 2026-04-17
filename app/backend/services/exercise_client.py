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

    def get_exercises(self, body_part: str = None, limit: int = 10):
        """Fetch exercises from the API, optionally filtered by body part."""
        url = f"{self.BASE_URL}/exercises"
        params = {"limit": 50}
        response = httpx.get(url, headers=self.headers, params=params)
        all_exercises = self._extract_list(response.json())
        if body_part:
            target = body_part.upper()
            return [
                ex for ex in all_exercises
                if (
                    (isinstance(ex.get("bodyParts"), list) and target in [bp.upper() for bp in ex.get("bodyParts")])
                    or (isinstance(ex.get("bodyPart"), str) and ex.get("bodyPart").upper() == target)
                )
            ][:limit]
        return all_exercises[:limit]

    def get_exercise_by_id(self, exercise_id: str):
        """Fetch a single exercise by its API ID."""
        url = f"{self.BASE_URL}/exercises/{exercise_id}"
        response = httpx.get(url, headers=self.headers)
        return response.json()

    def find_exercise_by_name(self, exercise_name: str):
        """Search for an exercise by name. Tries exact match first, then partial."""
        normalized_name = exercise_name.strip().lower()
        url = f"{self.BASE_URL}/exercises"

        response = httpx.get(
            url,
            headers=self.headers,
            params={"name": exercise_name, "limit": 50},
        )
        data = response.json()

        if isinstance(data, dict) and isinstance(data.get("data"), list):
            results = data.get("data", [])
        elif isinstance(data, list):
            results = data
        else:
            results = []

        for exercise in results:
            if str(exercise.get("name", "")).strip().lower() == normalized_name:
                return exercise

        for exercise in results:
            candidate = str(exercise.get("name", "")).strip().lower()
            if normalized_name in candidate or candidate in normalized_name:
                return exercise

        return None
