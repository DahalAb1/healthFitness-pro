import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from exercise_client import ExerciseClient
from templates_database.template_db import SessionLocal, engine, Base
from templates_database.template_db import get_all_templates, get_template_by_id, create_template

Base.metadata.create_all(bind=engine)

# Seed default templates if the database is empty
def seed_templates():
    db = SessionLocal()
    if len(get_all_templates(db)) == 0:
        create_template(db, "Push Day", "Chest, shoulders, and triceps", [
            {"exercise_id": "Bench Press", "target_sets": 4, "target_reps": 10},
            {"exercise_id": "Overhead Press", "target_sets": 3, "target_reps": 12},
            {"exercise_id": "Tricep Dips", "target_sets": 3, "target_reps": 15},
        ])
        create_template(db, "Pull Day", "Back and biceps", [
            {"exercise_id": "Barbell Row", "target_sets": 4, "target_reps": 8},
            {"exercise_id": "Pull Ups", "target_sets": 3, "target_reps": 12},
            {"exercise_id": "Bicep Curls", "target_sets": 3, "target_reps": 10},
        ])
        create_template(db, "Leg Day", "Quads, hamstrings, and glutes", [
            {"exercise_id": "Barbell Squat", "target_sets": 4, "target_reps": 10},
            {"exercise_id": "Romanian Deadlift", "target_sets": 3, "target_reps": 12},
            {"exercise_id": "Leg Press", "target_sets": 3, "target_reps": 15},
        ])
    db.close()

seed_templates()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

client = ExerciseClient()

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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ExerciseEntry(BaseModel):
    exercise_id: str
    target_sets: int
    target_reps: int


class TemplateCreate(BaseModel):
    name: str
    description: str = None
    exercises: list[ExerciseEntry]


def normalize_exercise_payload(payload: dict, fallback_name: str):
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


def resolve_exercise(exercise_ref: str):
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

        raise HTTPException(status_code=502, detail="External exercise service error")

    normalized = normalize_exercise_payload(data, exercise_ref)
    normalized["target"] = normalized.get("target") or local.get("target", "")
    normalized["equipment"] = normalized.get("equipment") or local.get("equipment", "")
    return normalized


def collect_target_muscle_text(exercise: dict):
    target = exercise.get("targetMuscles") or []
    return " ".join(str(part).lower() for part in target)


def collect_secondary_muscle_text(exercise: dict):
    secondary = exercise.get("secondaryMuscles") or []
    return " ".join(str(part).lower() for part in secondary)


def get_real_exercises_for_template(template_name: str):
    profile = TEMPLATE_MUSCLE_FILTERS.get(template_name.strip().lower())
    if not profile:
        return []

    all_exercises = client.get_exercises(limit=100)
    selected = []
    seen_ids = set()

    def find_matching_muscle(exercise: dict):
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

    for exercise in all_exercises:
        if str(exercise.get("exerciseType", "")).upper() != "STRENGTH":
            continue
        muscles = collect_target_muscle_text(exercise)
        if any(keyword in muscles for keyword in profile["keywords"]):
            add_exercise(exercise)
        if len(selected) >= profile["max_exercises"]:
            return selected

    if selected:
        return selected

    for exercise in all_exercises:
        if str(exercise.get("exerciseType", "")).upper() != "STRENGTH":
            continue
        muscles = collect_secondary_muscle_text(exercise)
        if any(keyword in muscles for keyword in profile["keywords"]):
            add_exercise(exercise)
        if len(selected) >= profile["max_exercises"]:
            break

    return selected


@app.get("/exercises")
def get_exercises(bodyPart: str = None):
    return client.get_exercises(body_part=bodyPart)

@app.get("/exercises/{exercise_id}")
def get_exercise(exercise_id: str):
    return resolve_exercise(exercise_id)


@app.get("/templates")
def list_templates(db: Session = Depends(get_db)):
    rows = get_all_templates(db)
    return [
        {
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "exercises": [
                {"exercise_id": e.exercise_id, "target_sets": e.target_sets, "target_reps": e.target_reps}
                for e in t.exercises
            ],
        }
        for t in rows
    ]


@app.get("/templates/{template_id}")
def get_template(template_id: int, db: Session = Depends(get_db)):
    t = get_template_by_id(db, template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    return {
        "id": t.id,
        "name": t.name,
        "description": t.description,
        "exercises": [
            {"exercise_id": e.exercise_id, "target_sets": e.target_sets, "target_reps": e.target_reps}
            for e in t.exercises
        ],
    }


@app.get("/templates/{template_id}/exercises")
def get_template_exercises(template_id: int, db: Session = Depends(get_db)):
    t = get_template_by_id(db, template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")

    exercises = get_real_exercises_for_template(t.name)

    if not exercises:
        for e in t.exercises:
            details = resolve_exercise(e.exercise_id)
            exercises.append({
                "exercise_id": e.exercise_id,
                "target_sets": e.target_sets,
                "target_reps": e.target_reps,
                "details": {
                    "id": details.get("id", e.exercise_id),
                    "name": details.get("name", e.exercise_id),
                    "muscle_group": details.get("target", ""),
                    "equipment": details.get("equipment", ""),
                    "description": details.get("instructions", ""),
                    "image_url": details.get("gifUrl", ""),
                },
            })

    return {
        "template_id": t.id,
        "template_name": t.name,
        "template_description": t.description,
        "exercises": exercises,
    }


@app.post("/templates", status_code=201)
def post_template(template: TemplateCreate, db: Session = Depends(get_db)):
    exercises = [ex.model_dump() for ex in template.exercises]
    t = create_template(db, template.name, template.description, exercises)
    return {
        "id": t.id,
        "name": t.name,
        "description": t.description,
        "exercises": [
            {"exercise_id": e.exercise_id, "target_sets": e.target_sets, "target_reps": e.target_reps}
            for e in t.exercises
        ],
    }
