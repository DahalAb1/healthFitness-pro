import httpx
from core.config import settings


class ExerciseClient:
    BASE_URL = "https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1"
    HOST = "edb-with-videos-and-images-by-ascendapi.p.rapidapi.com"

    def __init__(self):
        self.headers = {
            "x-rapidapi-key": settings.XRAPID_API_KEY,
            "x-rapidapi-host": self.HOST,
        }

    def _extract_list(self, data):
        """
        The external API returns exercises in different shapes depending
        on the endpoint. This normalizes all of them into a plain list.
        """
        if isinstance(data, dict):
            for key in ("data", "exercises", "items", "results", "body"):
                val = data.get(key)
                if isinstance(val, list):
                    return val
                if isinstance(val, dict):
                    for inner_key in ("exercises", "data", "items", "results"):
                        inner = val.get(inner_key)
                        if isinstance(inner, list):
                            return inner
        elif isinstance(data, list):
            return data
        return []

    def get_exercises(self, body_part: str = None, limit: int = 10):
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
        url = f"{self.BASE_URL}/exercises/{exercise_id}"
        response = httpx.get(url, headers=self.headers)
        return response.json()

    def find_exercise_by_name(self, exercise_name: str):
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
