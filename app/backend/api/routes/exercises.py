"""Exercise routes – list and look up individual exercises."""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from services.exercise_client import ExerciseClient
from services.exercise_service import resolve_exercise

router = APIRouter(tags=["exercises"])
client = ExerciseClient()


RATE_LIMIT_MESSAGE = "Exercise API rate limit reached. Please try again later."
# GIFs are immutable per exercise id, so let browsers cache aggressively;
# the disk cache on the server already handles repeat fetches.
IMAGE_CACHE_HEADERS = {"Cache-Control": "public, max-age=31536000, immutable"}


@router.get("/exercises")
def get_exercises(request: Request, bodyPart: str = None):
    """Return all exercises, optionally filtered by body part.

    Each item gets a `gifUrl` pointing at our local image proxy route, since the
    upstream API stopped including image URLs in this response. Using
    `request.url_for` produces an absolute URL anchored to the host the request
    arrived on, so it works whether the SPA is same-origin or cross-origin.
    """
    result = client.get_exercises(body_part=bodyPart)
    if isinstance(result, dict):
        if result.get("error") == "rate_limit":
            raise HTTPException(status_code=503, detail=RATE_LIMIT_MESSAGE)
        raise HTTPException(status_code=502, detail=result.get("detail") or "External exercise service error")
    for item in result:
        exercise_id = item.get("id")
        if exercise_id:
            item["gifUrl"] = str(request.url_for("get_exercise_image", exercise_id=exercise_id))
    return {"data": result}


@router.get(
    "/exercises/{exercise_id}",
    summary="Get exercise by ID",
)
def get_exercise(exercise_id: str):
    """Fetch a single exercise by ID. Maps rate limits to 503, other external errors to 502."""
    result = resolve_exercise(client, exercise_id)
    if result.get("error") == "rate_limit":
        raise HTTPException(status_code=503, detail=RATE_LIMIT_MESSAGE)
    if "error" in result:
        raise HTTPException(status_code=502, detail=result["error"])
    return result


@router.get("/exercises/{exercise_id}/image")
def get_exercise_image(exercise_id: str):
    """Proxy the GIF for an exercise from RapidAPI, served from a permanent disk cache.

    The dedicated /image endpoint requires an authenticated request, so the browser
    cannot fetch it directly — this route is the proxy that holds the API key.
    First request for a given id costs one upstream call; every subsequent request
    is served from disk for free.
    """
    result = client.get_exercise_image(exercise_id)
    if isinstance(result, dict):
        error = result.get("error")
        if error == "rate_limit":
            raise HTTPException(status_code=503, detail=RATE_LIMIT_MESSAGE)
        if error == "invalid_id":
            raise HTTPException(status_code=400, detail=result.get("detail", "Invalid exercise id"))
        raise HTTPException(status_code=502, detail=result.get("detail") or "Image fetch failed")
    return Response(content=result, media_type="image/gif", headers=IMAGE_CACHE_HEADERS)
