"""
Handles resolving exercise references against the external API.

When a template says "Bench Press", this service figures out the full
exercise details (muscle group, equipment, image) by querying the
RapidAPI exercise database, falling back to local data if needed.
"""

from services.exercise_client import ExerciseClient


def normalize_exercise_payload(payload: dict, fallback_name: str) -> dict:
    """
    Normalizes an ExerciseDB response into a consistent format.
    """
    data = payload if isinstance(payload, dict) else {}

    instructions = data.get("instructions", [])
    if isinstance(instructions, list):
        instructions = " ".join(instructions)

    return {
        "id": data.get("id") or fallback_name,
        "name": data.get("name") or fallback_name,
        "target": data.get("target") or "",
        "equipment": data.get("equipment") or "",
        "instructions": instructions,
        "gifUrl": data.get("gifUrl") or "",
    }


def resolve_exercise(client: ExerciseClient, exercise_ref: str) -> dict:
    """
    Given an exercise name/ID, return full details by:
    1. Try fetching by ID from the API
    2. If not found, search by name
    """
    data = client.get_exercise_by_id(exercise_ref)

    if isinstance(data, dict) and data.get("error") == "rate_limit":
        return {"error": "rate_limit"}

    # Any error from the ID lookup means exercise_ref is a name, not a real ID.
    # Fall back to name search to get the actual ExerciseDB entry and its numeric ID.
    if isinstance(data, dict) and "error" in data:
        by_name = client.find_exercise_by_name(exercise_ref)
        if isinstance(by_name, dict) and by_name.get("error") == "rate_limit":
            return {"error": "rate_limit"}
        if by_name and isinstance(by_name, dict) and "error" not in by_name:
            return normalize_exercise_payload(by_name, exercise_ref)

        return {"error": "Exercise not found"}

    return normalize_exercise_payload(data, exercise_ref)
