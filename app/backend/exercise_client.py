import httpx
import os
from dotenv import load_dotenv

load_dotenv()

class ExerciseClient:
    BASE_URL = "https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1"
    HOST = "edb-with-videos-and-images-by-ascendapi.p.rapidapi.com"

    def __init__(self):
        self.headers = {
            "x-rapidapi-key": os.getenv("XRAPID_API_KEY"),
            "x-rapidapi-host": self.HOST
        }

    def get_exercises(self, body_part: str = None, limit: int = 10):
        url = f"{self.BASE_URL}/exercises"
        params = {"limit": limit}
        if body_part:
            params["bodyPart"] = body_part
        response = httpx.get(url, headers=self.headers, params=params)
        data = response.json()
        if isinstance(data, dict) and isinstance(data.get("data"), list):
            return data.get("data", [])
        if isinstance(data, list):
            return data
        return []

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
            params={"name": exercise_name, "limit": 50}
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
