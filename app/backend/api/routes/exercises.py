"""Exercise routes – list and look up individual exercises."""

from fastapi import APIRouter, HTTPException
from services.exercise_client import ExerciseClient
from services.exercise_service import resolve_exercise

router = APIRouter()
client = ExerciseClient()


@router.get("/exercises")
def get_exercises(bodyPart: str = None):
    """Return all exercises, optionally filtered by body part."""
    return {"data": client.get_exercises(body_part=bodyPart)}


@router.get("/exercises/{exercise_id}")
def get_exercise(exercise_id: str):
    """Fetch a single exercise by ID. Returns 502 if the external API fails."""
    result = resolve_exercise(client, exercise_id)
    if "error" in result:
        raise HTTPException(status_code=502, detail=result["error"])
    return result
