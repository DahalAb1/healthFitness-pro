"""
Handles resolving exercise references against the external API.

When a template says "Bench Press", this service figures out the full
exercise details (muscle group, equipment, image) by querying the
RapidAPI exercise database, falling back to local data if needed.
"""

from services.exercise_client import ExerciseClient

# Fallback data for common exercises when the external API can't find them
LOCAL_EXERCISE_FALLBACKS = {
    "bench press": {"target": "chest", "equipment": "barbell", "aliases": ["Bench Press"]},
    "overhead press": {"target": "shoulders", "equipment": "barbell", "aliases": ["Shoulder Press", "Overhead Shoulder Press"]},
    "tricep dips": {"target": "triceps", "equipment": "body weight", "aliases": ["Triceps Dip"]},
    "barbell row": {"target": "back", "equipment": "barbell", "aliases": ["Bent-over Row", "One Arm Bent-over Row", "Seated Row with Towel"]},
    "pull ups": {"target": "lats", "equipment": "body weight", "aliases": ["Pull-Up", "Wide Grip Pull-Up"]},
    "bicep curls": {"target": "biceps", "equipment": "dumbbell", "aliases": ["Biceps Curl", "Hammer Curl", "Cross Body Hammer Curl"]},
    "barbell squat": {"target": "quads", "equipment": "barbell", "aliases": ["Squat", "Split Squats"]},
    "romanian deadlift": {"target": "hamstrings", "equipment": "barbell", "aliases": ["Romanian Deadlift"]},
    "leg press": {"target": "quads", "equipment": "machine", "aliases": ["Leg Press"]},
}


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
    3. If still not found, try known aliases
    4. Last resort: return local fallback data
    """
    data = client.get_exercise_by_id(exercise_ref)
    local = LOCAL_EXERCISE_FALLBACKS.get(exercise_ref.strip().lower(), {})

    if isinstance(data, dict) and isinstance(data.get("error"), dict):
        if data["error"].get("code") == "NOT_FOUND":
            by_name = client.find_exercise_by_name(exercise_ref)
            if by_name:
                normalized = normalize_exercise_payload(by_name, exercise_ref)
                normalized["target"] = normalized.get("target") or local.get("target", "")
                normalized["equipment"] = normalized.get("equipment") or local.get("equipment", "")
                return normalized

            for alias in local.get("aliases", []):
                by_alias = client.find_exercise_by_name(alias)
                if by_alias:
                    normalized = normalize_exercise_payload(by_alias, exercise_ref)
                    normalized["name"] = exercise_ref
                    normalized["target"] = normalized.get("target") or local.get("target", "")
                    normalized["equipment"] = normalized.get("equipment") or local.get("equipment", "")
                    return normalized

            return {
                "id": exercise_ref,
                "name": exercise_ref,
                "target": local.get("target", ""),
                "equipment": local.get("equipment", ""),
                "instructions": "",
                "gifUrl": "",
            }

        return {"error": "External exercise service error"}

    normalized = normalize_exercise_payload(data, exercise_ref)
    normalized["target"] = normalized.get("target") or local.get("target", "")
    normalized["equipment"] = normalized.get("equipment") or local.get("equipment", "")
    return normalized
