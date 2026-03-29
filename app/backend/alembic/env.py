"""
Alembic env.py — the only file in alembic/ you need to understand.

It does two things:
1. Connects to the database (using DATABASE_URL from our .env)
2. Imports all our models so Alembic can compare them to the database
   and detect what changed

Everything else in alembic/ is auto-generated and you don't touch it.
"""

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# --- 1. Connect to our database ---
from core.config import settings
config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# --- 2. Import all models so Alembic can track them ---
from sqlmodel import SQLModel
from models.template import WorkoutTemplate, TemplateExercise  # noqa
from models.workout import WorkoutSession, WorkoutExercise  # noqa
from models.custom_workout import CustomWorkout, CustomWorkoutExercise  # noqa
from models.user import User  # noqa

target_metadata = SQLModel.metadata

# --- Boilerplate below: handles connecting and running migrations ---

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
