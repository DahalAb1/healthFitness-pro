import os
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DB_PATH = os.path.join(os.path.dirname(__file__), "templates.db")
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)

    exercises = relationship(
        "TemplateExercise", back_populates="template", cascade="all, delete-orphan"
    )


class TemplateExercise(Base):
    __tablename__ = "template_exercises"

    id = Column(Integer, primary_key=True, autoincrement=True)
    template_id = Column(Integer, ForeignKey("workout_templates.id"), nullable=False)
    exercise_id = Column(String, nullable=False)
    target_sets = Column(Integer, nullable=False)
    target_reps = Column(Integer, nullable=False)

    template = relationship("WorkoutTemplate", back_populates="exercises")


# ── CRUD ─────────────────────────────────────────────────────────────

def get_all_templates(db):
    return db.query(WorkoutTemplate).all()


def get_template_by_id(db, template_id):
    return db.query(WorkoutTemplate).filter(WorkoutTemplate.id == template_id).first()


def create_template(db, name, description, exercises):
    template = WorkoutTemplate(name=name, description=description)
    for ex in exercises:
        template.exercises.append(
            TemplateExercise(
                exercise_id=ex["exercise_id"],
                target_sets=ex["target_sets"],
                target_reps=ex["target_reps"],
            )
        )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template
