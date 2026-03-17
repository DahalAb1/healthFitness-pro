from fastapi import APIRouter, HTTPException
from services.exercise_client import ExerciseClient
from services.exercise_service import resolve_exercise

router = APIRouter()
client = ExerciseClient()


@router.get("/exercises")
def get_exercises(bodyPart: str = None):
    return {"data": client.get_exercises(body_part=bodyPart)}


@router.get("/exercises/{exercise_id}")
def get_exercise(exercise_id: str):
    result = resolve_exercise(client, exercise_id)
    if "error" in result:
        raise HTTPException(status_code=502, detail=result["error"])
    return result
