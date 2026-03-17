from sqlmodel import Session, select
from models.template import WorkoutTemplate, TemplateExercise


def get_all(session: Session) -> list[WorkoutTemplate]:
    """Return every workout template."""
    return session.exec(select(WorkoutTemplate)).all()


def get_by_id(session: Session, template_id: int) -> WorkoutTemplate | None:
    """Return a single template by ID, or None if not found."""
    return session.get(WorkoutTemplate, template_id)


def create(
    session: Session,
    name: str,
    description: str | None,
    exercises: list[dict],
) -> WorkoutTemplate:
    """
    Create a new template with its exercises.
    exercises is a list of dicts with keys: exercise_id, target_sets, target_reps.
    """
    template = WorkoutTemplate(name=name, description=description)
    for ex in exercises:
        template.exercises.append(
            TemplateExercise(
                exercise_id=ex["exercise_id"],
                target_sets=ex["target_sets"],
                target_reps=ex["target_reps"],
            )
        )
    session.add(template)
    session.commit()
    session.refresh(template)
    return template
