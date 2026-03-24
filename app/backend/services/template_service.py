"""
Template-specific business logic: seeding default templates and
finding real exercises from the API that match a template's muscle groups.
"""

from sqlmodel import Session
from services.exercise_client import ExerciseClient
from services.exercise_service import normalize_exercise_payload
from crud import templates as templates_crud

# Defines which muscles belong to each template type,
# used to filter exercises from the external API
TEMPLATE_MUSCLE_FILTERS = {
    "push day": {
        "keywords": ["pectoralis", "deltoid", "triceps"],
        "target_sets": 4,
        "target_reps": 10,
        "max_exercises": 8,
    },
    "pull day": {
        "keywords": ["latissimus", "trapezius", "rhomboid", "biceps"],
        "target_sets": 4,
        "target_reps": 10,
        "max_exercises": 8,
    },
    "leg day": {
        "keywords": ["quadriceps", "hamstrings", "glute", "adductor", "calf"],
        "target_sets": 4,
        "target_reps": 12,
        "max_exercises": 8,
    },
}

# Default templates seeded on first startup
DEFAULT_TEMPLATES = [
    ("Push Day", "Chest, shoulders, and triceps", [
        {"exercise_id": "Bench Press", "target_sets": 4, "target_reps": 10},
        {"exercise_id": "Overhead Press", "target_sets": 3, "target_reps": 12},
        {"exercise_id": "Tricep Dips", "target_sets": 3, "target_reps": 15},
    ]),
    ("Pull Day", "Back and biceps", [
        {"exercise_id": "Barbell Row", "target_sets": 4, "target_reps": 8},
        {"exercise_id": "Pull Ups", "target_sets": 3, "target_reps": 12},
        {"exercise_id": "Bicep Curls", "target_sets": 3, "target_reps": 10},
    ]),
    ("Leg Day", "Quads, hamstrings, and glutes", [
        {"exercise_id": "Barbell Squat", "target_sets": 4, "target_reps": 10},
        {"exercise_id": "Romanian Deadlift", "target_sets": 3, "target_reps": 12},
        {"exercise_id": "Leg Press", "target_sets": 3, "target_reps": 15},
    ]),
]


def seed_templates(session: Session) -> None:
    """Insert default templates if the database is empty."""
    if templates_crud.get_all(session):
        return
    for name, description, exercises in DEFAULT_TEMPLATES:
        templates_crud.create(session, name, description, exercises)


def get_real_exercises_for_template(client: ExerciseClient, template_name: str) -> list[dict]:
    """
    Query the external exercise API and return exercises that match
    the muscle groups for the given template name (e.g. "Push Day").
    """
    profile = TEMPLATE_MUSCLE_FILTERS.get(template_name.strip().lower())
    if not profile:
        return []

    all_exercises = client.get_exercises(limit=100)
    selected = []
    seen_ids = set()

    def find_matching_muscle(exercise: dict) -> str:
        target_muscles = [str(m).lower() for m in (exercise.get("targetMuscles") or [])]
        secondary_muscles = [str(m).lower() for m in (exercise.get("secondaryMuscles") or [])]
        for keyword in profile["keywords"]:
            for muscle in target_muscles:
                if keyword in muscle:
                    return muscle
        for keyword in profile["keywords"]:
            for muscle in secondary_muscles:
                if keyword in muscle:
                    return muscle
        return ""

    def add_exercise(exercise: dict):
        normalized = normalize_exercise_payload(exercise, exercise.get("name", ""))
        exercise_id = normalized.get("id")
        if not exercise_id or exercise_id in seen_ids:
            return
        matched_muscle = find_matching_muscle(exercise)
        seen_ids.add(exercise_id)
        selected.append({
            "exercise_id": exercise_id,
            "target_sets": profile["target_sets"],
            "target_reps": profile["target_reps"],
            "details": {
                "id": exercise_id,
                "name": normalized.get("name", ""),
                "muscle_group": matched_muscle or normalized.get("target", ""),
                "equipment": normalized.get("equipment", ""),
                "description": normalized.get("instructions", ""),
                "image_url": normalized.get("gifUrl", ""),
            },
        })

    # First pass: match by primary target muscles
    for exercise in all_exercises:
        if str(exercise.get("exerciseType", "")).upper() != "STRENGTH":
            continue
        muscles = " ".join(str(m).lower() for m in (exercise.get("targetMuscles") or []))
        if any(keyword in muscles for keyword in profile["keywords"]):
            add_exercise(exercise)
        if len(selected) >= profile["max_exercises"]:
            return selected

    if selected:
        return selected

    # Second pass: fall back to secondary muscles
    for exercise in all_exercises:
        if str(exercise.get("exerciseType", "")).upper() != "STRENGTH":
            continue
        muscles = " ".join(str(m).lower() for m in (exercise.get("secondaryMuscles") or []))
        if any(keyword in muscles for keyword in profile["keywords"]):
            add_exercise(exercise)
        if len(selected) >= profile["max_exercises"]:
            break

    return selected
