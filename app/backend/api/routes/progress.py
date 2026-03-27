"""Progress routes – weight tracking trends over time."""

from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from api.deps import get_session, get_current_user
from crud import workouts as workouts_crud
from models.exercise import ProgressPoint, WeightProgressResponse
from models.user import User

router = APIRouter()


@router.get("/progress/weights", response_model=WeightProgressResponse)
def get_weight_progress(
    exercise_name: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return the logged-in user's max-weight-per-date trend for a given exercise,
    along with overall change and percent change."""
    ex_name = exercise_name.strip()
    if not ex_name:
        raise HTTPException(status_code=400, detail="exercise_name cannot be empty")

    per_date_max = workouts_crud.get_weight_progress(session, current_user.id, ex_name)

    points = [
        ProgressPoint(date=date.fromisoformat(d), weight=per_date_max[d])
        for d in sorted(per_date_max.keys())
    ]

    if not points:
        raise HTTPException(
            status_code=404,
            detail="No matching exercise entries found for that user",
        )

    first_weight = points[0].weight
    last_weight = points[-1].weight
    change = last_weight - first_weight
    percent_change = (change / first_weight) * 100.0 if first_weight > 0 else None

    return WeightProgressResponse(
        exercise_name=ex_name,
        points=points,
        first_weight=first_weight,
        last_weight=last_weight,
        change=change,
        percent_change=percent_change,
    )