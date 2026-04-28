"""HTTP client for the external exercise database (RapidAPI)."""

import time
from pathlib import Path
from typing import Any

import httpx
from core.config import settings


class ExerciseClient:
    BASE_URL = "https://exercisedb.p.rapidapi.com"
    HOST = "exercisedb.p.rapidapi.com"
    CACHE_TTL_SECONDS = 3600
    TIMEOUT_SECONDS = 10.0
    # GIFs never change, so a permanent on-disk cache survives server restarts
    # and keeps RapidAPI quota usage at "once per exercise, ever".
    IMAGE_CACHE_DIR = Path(__file__).resolve().parent.parent / ".cache" / "exercise_images"
    IMAGE_RESOLUTION = "180"

    def __init__(self):
        self.headers = {
            "x-rapidapi-key": settings.XRAPID_API_KEY,
            "x-rapidapi-host": self.HOST,
        }
        self._exercises_cache = {}

    def _extract_error_detail(self, response: httpx.Response) -> str:
        """Best-effort extraction of a human-readable error message from an upstream response."""
        try:
            payload = response.json()
        except ValueError:
            text = (response.text or "").strip()
            return text or f"Upstream error (HTTP {response.status_code})"

        if isinstance(payload, dict):
            # RapidAPI providers vary; these cover most common cases.
            for key in ("message", "detail", "error", "errorMessage"):
                if isinstance(payload.get(key), str) and payload[key].strip():
                    return payload[key].strip()
            # Sometimes the entire dict is the message.
            return str(payload)

        return str(payload)

    def _get(self, url: str, params: dict | None = None) -> Any:
        """HTTP GET with shared headers. Never raises; returns JSON or a structured error dict."""
        if not settings.XRAPID_API_KEY:
            return {"error": "missing_api_key", "detail": "XRAPID_API_KEY is not configured"}

        try:
            response = httpx.get(url, headers=self.headers, params=params, timeout=self.TIMEOUT_SECONDS)
        except httpx.RequestError as exc:
            return {"error": "network_error", "detail": str(exc)}

        if response.status_code == 429:
            return {"error": "rate_limit"}

        if response.status_code >= 400:
            return {
                "error": "upstream_error",
                "status_code": response.status_code,
                "detail": self._extract_error_detail(response),
            }

        try:
            return response.json()
        except ValueError:
            return {"error": "upstream_error", "status_code": 502, "detail": "Upstream returned non-JSON"}

    def get_exercises(self, body_part: str = None, limit: int = 10):
        """Fetch exercises from the API, optionally filtered by body part.

        Successful responses are cached per (body_part, limit) for CACHE_TTL_SECONDS
        to avoid burning RapidAPI quota on repeat page loads. Errors are not cached.
        """
        cache_key = (body_part, limit)
        cached = self._exercises_cache.get(cache_key)
        if cached and (time.monotonic() - cached[0]) < self.CACHE_TTL_SECONDS:
            return cached[1]

        if body_part in ("biceps", "triceps"):
            url = f"{self.BASE_URL}/exercises/target/{body_part}"
        elif body_part:
            url = f"{self.BASE_URL}/exercises/bodyPart/{body_part}"
        else:
            url = f"{self.BASE_URL}/exercises"
        result = self._get(url, params={"limit": limit})
        if (
            isinstance(result, dict)
            and result.get("error") == "upstream_error"
            and result.get("status_code") == 400
        ):
            # Some upstream routes reject unknown query params; retry without `limit`.
            result = self._get(url)

        if isinstance(result, dict) and result.get("error"):
            return result

        # Some ExerciseDB endpoints ignore the `limit` param. Enforce the cap locally.
        if isinstance(result, list):
            if isinstance(limit, int) and limit > 0:
                result = result[:limit]
        else:
            # Don't cache unexpected shapes; surface them as upstream errors instead.
            return {
                "error": "upstream_error",
                "status_code": 502,
                "detail": "Unexpected upstream response shape (expected a list)",
            }

        self._exercises_cache[cache_key] = (time.monotonic(), result)
        return result

    def get_exercise_by_id(self, exercise_id: str):
        """Fetch a single exercise by its API ID."""
        url = f"{self.BASE_URL}/exercises/exercise/{exercise_id}"
        return self._get(url)

    def get_exercise_image(self, exercise_id: str):
        """Fetch the GIF for an exercise, disk-caching it to preserve API quota.

        Returns raw image bytes on success, or a structured error dict on failure
        (same shape as the JSON helpers above). The on-disk cache is permanent
        because exercise GIFs never change — no TTL needed.
        """
        # Hard alphanumeric guard: the id is used as a filename, so anything
        # else (slashes, dots, etc.) is rejected to prevent path traversal.
        if not exercise_id or not exercise_id.isalnum():
            return {"error": "invalid_id", "detail": "Exercise ID must be alphanumeric"}

        cache_path = self.IMAGE_CACHE_DIR / f"{exercise_id}.gif"
        if cache_path.exists():
            return cache_path.read_bytes()

        if not settings.XRAPID_API_KEY:
            return {"error": "missing_api_key", "detail": "XRAPID_API_KEY is not configured"}

        try:
            response = httpx.get(
                f"{self.BASE_URL}/image",
                headers=self.headers,
                params={"exerciseId": exercise_id, "resolution": self.IMAGE_RESOLUTION},
                timeout=self.TIMEOUT_SECONDS,
            )
        except httpx.RequestError as exc:
            return {"error": "network_error", "detail": str(exc)}

        if response.status_code == 429:
            return {"error": "rate_limit"}
        if response.status_code >= 400:
            return {
                "error": "upstream_error",
                "status_code": response.status_code,
                "detail": self._extract_error_detail(response),
            }

        # Defensive: confirm the body is actually an image before persisting it.
        content_type = response.headers.get("content-type", "")
        if not content_type.startswith("image/"):
            return {
                "error": "upstream_error",
                "status_code": 502,
                "detail": f"Expected image response, got {content_type or 'unknown'}",
            }

        self.IMAGE_CACHE_DIR.mkdir(parents=True, exist_ok=True)
        cache_path.write_bytes(response.content)
        return response.content

    def find_exercise_by_name(self, exercise_name: str):
        """Search for an exercise by name. Returns the first match, None, or a rate_limit error dict."""
        url = f"{self.BASE_URL}/exercises/name/{exercise_name}"
        results = self._get(url)
        if isinstance(results, dict) and results.get("error") == "rate_limit":
            return results
        if isinstance(results, dict) and results.get("error") == "upstream_error":
            return results
        if isinstance(results, list) and results:
            return results[0]
        return None
