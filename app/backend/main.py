import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from exercise_client import ExerciseClient
from template_db import SessionLocal, engine, Base
from template_db import get_all_templates, get_template_by_id, create_template

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

client = ExerciseClient()


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


@app.get("/exercises")
def get_exercises(bodyPart: str = None):
    return client.get_exercises(body_part=bodyPart)

@app.get("/exercises/{exercise_id}")
def get_exercise(exercise_id: str):
    return client.get_exercise_by_id(exercise_id)


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
