from fastapi import APIRouter
<<<<<<< HEAD
from api.routes import exercises, templates, workouts, progress, custom_workouts, nutrition
=======
from api.routes import exercises, templates, workouts, progress, custom_workouts, auth
>>>>>>> feature/SCRUM-19-the-personal-account

# Single router that includes all route modules
api_router = APIRouter()
api_router.include_router(exercises.router)
api_router.include_router(templates.router)
api_router.include_router(workouts.router)
api_router.include_router(progress.router)
api_router.include_router(custom_workouts.router)
<<<<<<< HEAD
api_router.include_router(nutrition.router)
=======
api_router.include_router(auth.router)
>>>>>>> feature/SCRUM-19-the-personal-account
