import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from exercise_client import ExerciseClient

app = FastAPI()
client = ExerciseClient()

@app.get("/exercises")
def get_exercises(bodyPart: str = None):
    return client.get_exercises(body_part=bodyPart)

@app.get("/exercises/{exercise_id}")
def get_exercise(exercise_id: str):
    return client.get_exercise_by_id(exercise_id)
