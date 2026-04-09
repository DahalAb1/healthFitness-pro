"""Exercise routes – list and look up individual exercises."""

from fastapi import APIRouter, HTTPException

from services.exercise_client import ExerciseClient
from services.exercise_service import resolve_exercise

router = APIRouter(tags=["exercises"])
client = ExerciseClient()


@router.get(
    "/exercises",
    summary="List exercises",
)
def get_exercises(bodyPart: str = None):
    """Return a list of exercises, optionally filtered by body part."""
    return {"data": client.get_exercises(body_part=bodyPart)}


@router.get(
    "/exercises/{exercise_id}",
    summary="Get exercise by ID",
)
def get_exercise(exercise_id: str):
    """Return details for a single exercise by ID."""
    result = resolve_exercise(client, exercise_id)
    if "error" in result:
        raise HTTPException(status_code=502, detail=result["error"])
    return result