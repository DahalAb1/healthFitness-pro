from fastapi import APIRouter
from api.routes import exercises, templates, workouts, progress, custom_workouts, auth, nutrition

# Single router that includes all route modules
api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(exercises.router)
api_router.include_router(templates.router)
api_router.include_router(workouts.router)
api_router.include_router(progress.router)
api_router.include_router(custom_workouts.router)
api_router.include_router(nutrition.router)