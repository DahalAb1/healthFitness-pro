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

    def _extract_list(self, data):
        """
        Robustly extract the exercises list from any common response shape:
          - plain list:                       [...]
          - { "data": [...] }
          - { "exercises": [...] }
          - { "data": { "exercises": [...] } }
          - { "data": { "data": [...] } }
        """
        if isinstance(data, list):
            return data
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
        return []

    def get_exercises(self, body_part: str = None):
        url = f"{self.BASE_URL}/exercises"
        params = {"limit": 50}
        response = httpx.get(url, headers=self.headers, params=params)
        all_exercises = self._extract_list(response.json())
        if body_part:
            target = body_part.upper()
            return [
                ex for ex in all_exercises
                if target in [bp.upper() for bp in (ex.get("bodyParts") or [])]
            ]
        return all_exercises[:10]

    def get_exercise_by_id(self, exercise_id: str):
        url = f"{self.BASE_URL}/exercises/{exercise_id}"
        response = httpx.get(url, headers=self.headers)
        return response.json()
