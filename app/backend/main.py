"""Application entry point – creates the FastAPI app, wires middleware and routes."""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from core.db import create_db_and_tables, engine
from api.main import api_router
from services.template_service import seed_templates


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup hook: create DB tables and seed default templates."""
    create_db_and_tables()
    with Session(engine) as session:
        seed_templates(session)
    yield


app = FastAPI(lifespan=lifespan)

# change allow_origins=["*"], when we are ready to move to production. 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "DELETE", "PATCH"],
    allow_headers=["*"],
)

app.include_router(api_router)
