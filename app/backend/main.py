import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from exercise_client import ExerciseClient

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

client = ExerciseClient()

# In-memory storage for templates (will be replaced with database later)
templates = []
next_template_id = 1


class TemplateCreate(BaseModel):
    name: str
    exercises: list

@app.get("/exercises")
def get_exercises(bodyPart: str = None):
    return client.get_exercises(body_part=bodyPart)

@app.get("/exercises/{exercise_id}")
def get_exercise(exercise_id: str):
    return client.get_exercise_by_id(exercise_id)


@app.get("/templates")
def get_templates():
    return templates


@app.get("/templates/{template_id}")
def get_template(template_id: int):
    for template in templates:
        if template["id"] == template_id:
            return template
    raise HTTPException(status_code=404, detail="Template not found")


@app.post("/templates", status_code=201)
def create_template(template: TemplateCreate):
    global next_template_id
    new_template = {
        "id": next_template_id,
        "name": template.name,
        "exercises": template.exercises,
    }
    templates.append(new_template)
    next_template_id += 1
    return new_template
