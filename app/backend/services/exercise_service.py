"""
Handles resolving exercise references against the external API.

When a template says "Bench Press", this service figures out the full
exercise details (muscle group, equipment, image) by querying the
RapidAPI exercise database, falling back to local data if needed.
"""

from services.exercise_client import ExerciseClient


def normalize_exercise_payload(payload: dict, fallback_name: str) -> dict:
    """
    The external API returns exercise data in inconsistent shapes.
    This normalizes any response into a consistent format.
    """
    data = payload.get("data") if isinstance(payload, dict) and isinstance(payload.get("data"), dict) else payload
    if not isinstance(data, dict):
        data = {}

    target_muscles = data.get("targetMuscles") or []
    equipments = data.get("equipments") or []

    target = data.get("target")
    if not target and target_muscles:
        target = target_muscles[0].lower()

    equipment = data.get("equipment")
    if not equipment and equipments:
        equipment = str(equipments[0]).lower()

    image_url = data.get("gifUrl") or data.get("image_url") or data.get("imageUrl")
    if not image_url and isinstance(data.get("imageUrls"), dict):
        image_url = data.get("imageUrls", {}).get("480p") or data.get("imageUrls", {}).get("360p")

    return {
        "id": data.get("id") or data.get("exerciseId") or fallback_name,
        "name": data.get("name") or fallback_name,
        "target": target or "",
        "equipment": equipment or "",
        "instructions": data.get("instructions") or "",
        "gifUrl": image_url or "",
    }


def resolve_exercise(client: ExerciseClient, exercise_ref: str) -> dict:
    """
    Given an exercise name/ID, return full details by:
    1. Try fetching by ID from the API
    2. If not found, search by name
    """
    data = client.get_exercise_by_id(exercise_ref)

    if isinstance(data, dict) and isinstance(data.get("error"), dict):
        if data["error"].get("code") == "NOT_FOUND":
            by_name = client.find_exercise_by_name(exercise_ref)
            if by_name:
                return normalize_exercise_payload(by_name, exercise_ref)

            return {"error": "Exercise not found"}

        return {"error": "External exercise service error"}

    return normalize_exercise_payload(data, exercise_ref)
