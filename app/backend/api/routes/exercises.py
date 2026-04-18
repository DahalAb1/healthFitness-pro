"""Exercise routes – list and look up individual exercises."""

from fastapi import APIRouter, HTTPException
from services.exercise_client import ExerciseClient
from services.exercise_service import resolve_exercise

router = APIRouter()
client = ExerciseClient()


RATE_LIMIT_MESSAGE = "Exercise API rate limit reached. Please try again later."


@router.get("/exercises")
def get_exercises(bodyPart: str = None):
    """Return all exercises, optionally filtered by body part."""
    result = client.get_exercises(body_part=bodyPart)
    if isinstance(result, dict) and result.get("error") == "rate_limit":
        raise HTTPException(status_code=503, detail=RATE_LIMIT_MESSAGE)
    return {"data": result}


@router.get("/exercises/{exercise_id}")
def get_exercise(exercise_id: str):
    """Fetch a single exercise by ID. Maps rate limits to 503, other external errors to 502."""
    result = resolve_exercise(client, exercise_id)
    if result.get("error") == "rate_limit":
        raise HTTPException(status_code=503, detail=RATE_LIMIT_MESSAGE)
    if "error" in result:
        raise HTTPException(status_code=502, detail=result["error"])
    return result
