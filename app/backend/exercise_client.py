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

    def get_exercises(self, body_part: str = None):
        url = f"{self.BASE_URL}/exercises"
        params = {"limit": 10}
        if body_part:
            params["bodyPart"] = body_part
        response = httpx.get(url, headers=self.headers, params=params)
        return response.json()

    def get_exercise_by_id(self, exercise_id: str):
        url = f"{self.BASE_URL}/exercises/{exercise_id}"
        response = httpx.get(url, headers=self.headers)
        return response.json()
