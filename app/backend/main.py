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
    # Runs once on startup: create tables and seed default data
    create_db_and_tables()
    with Session(engine) as session:
        seed_templates(session)
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

app.include_router(api_router)
