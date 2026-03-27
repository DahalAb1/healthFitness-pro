"""Template routes – CRUD for workout templates and their exercises."""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from api.deps import get_session, get_current_user
from crud import templates as templates_crud
from models.template import TemplateCreate
from models.user import User
from services.exercise_client import ExerciseClient
from services.exercise_service import resolve_exercise
from services.template_service import get_real_exercises_for_template

router = APIRouter()
client = ExerciseClient()


def _template_to_dict(t):
    """Convert a template + its exercises to a response dict."""
    return {
        "id": t.id,
        "name": t.name,
        "description": t.description,
        "exercises": [
            {"exercise_id": e.exercise_id, "target_sets": e.target_sets, "target_reps": e.target_reps}
            for e in t.exercises
        ],
    }


@router.get("/templates")
def list_templates(session: Session = Depends(get_session)):
    """Return all workout templates with their exercises."""
    return [_template_to_dict(t) for t in templates_crud.get_all(session)]


@router.get("/templates/{template_id}")
def get_template(template_id: int, session: Session = Depends(get_session)):
    """Fetch a single template by ID. Returns 404 if not found."""
    t = templates_crud.get_by_id(session, template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    return _template_to_dict(t)


@router.get("/templates/{template_id}/exercises")
def get_template_exercises(template_id: int, session: Session = Depends(get_session)):
    """Get full exercise details for a template, pulling from the external API.
    Falls back to resolving exercises individually if bulk lookup returns nothing."""
    t = templates_crud.get_by_id(session, template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")

    exercises = get_real_exercises_for_template(client, t.name)

    # If the API returned nothing, fall back to resolving each exercise individually
    if not exercises:
        for e in t.exercises:
            details = resolve_exercise(client, e.exercise_id)
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


@router.post("/templates", status_code=201)
def create_template(
    template: TemplateCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Create a new workout template with its exercises."""
    exercises = [ex.model_dump() for ex in template.exercises]
    t = templates_crud.create(
        session,
        name=template.name,
        description=template.description,
        exercises=exercises,
    )
    return _template_to_dict(t)