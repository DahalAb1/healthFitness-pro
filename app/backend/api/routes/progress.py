from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from api.deps import get_session
from crud import workouts as workouts_crud
from models.exercise import ProgressPoint, WeightProgressResponse

router = APIRouter()


@router.get("/progress/weights", response_model=WeightProgressResponse)
def get_weight_progress(user_id: int, exercise_name: str, session: Session = Depends(get_session)):
    ex_name = exercise_name.strip()
    if not ex_name:
        raise HTTPException(status_code=400, detail="exercise_name cannot be empty")

    per_date_max = workouts_crud.get_weight_progress(session, user_id, ex_name)

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
        user_id=user_id,
        exercise_name=ex_name,
        points=points,
        first_weight=first_weight,
        last_weight=last_weight,
        change=change,
        percent_change=percent_change,
    )
