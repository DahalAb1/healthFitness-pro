"""Application entry point – creates the FastAPI app, wires middleware and routes."""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "DELETE", "PATCH"],
    allow_headers=["*"],
)

app.include_router(api_router)

# --- Serve React SPA from /app/static ---
STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "static"

if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")