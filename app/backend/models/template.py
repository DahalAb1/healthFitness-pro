from sqlmodel import SQLModel, Field, Relationship


class TemplateExercise(SQLModel, table=True):
    """
    A single exercise entry within a workout template.
    Each row links an exercise to a template with target sets/reps.
    """
    __tablename__ = "template_exercises"

    id: int | None = Field(default=None, primary_key=True)
    template_id: int = Field(foreign_key="workout_templates.id")
    exercise_id: str
    target_sets: int
    target_reps: int

    # Relationship back to the parent template
    template: "WorkoutTemplate" = Relationship(back_populates="exercises")


class WorkoutTemplate(SQLModel, table=True):
    """
    A reusable workout template (e.g. "Push Day", "Pull Day").
    Contains a list of exercises with target sets and reps.
    """
    __tablename__ = "workout_templates"

    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str | None = None

    # One template has many exercises. cascade delete removes exercises
    # when the template is deleted.
    exercises: list[TemplateExercise] = Relationship(
        back_populates="template",
        cascade_delete=True,
    )
