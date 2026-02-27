import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from exercise_client import ExerciseClient
from workout_routes import router as workout_router

app = FastAPI()
<<<<<<< HEAD:backend/main.py
app.include_router(workout_router)
=======

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

>>>>>>> dev:app/backend/main.py
client = ExerciseClient()

@app.get("/exercises")
def get_exercises(bodyPart: str = None):
    return client.get_exercises(body_part=bodyPart)

@app.get("/exercises/{exercise_id}")
def get_exercise(exercise_id: str):
    return client.get_exercise_by_id(exercise_id)
