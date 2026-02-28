from fastapi import APIRouter, HTTPException
from typing import Dict, List
from datetime import date
from models import WorkoutSession, WeightProgressResponse, ProgressPoint
from workout_routes import workouts_db

router = APIRouter()


@router.get("/progress/weights", response_model=WeightProgressResponse)
def get_weight_progress(user_id: int, exercise_name: str):
    ex_name = exercise_name.strip()
    if not ex_name:
        raise HTTPException(status_code=400, detail="exercise_name cannot be empty")

    # Map date -> max weight on that date for this exercise
    per_date_max: Dict[date, float] = {}

    for w in workouts_db:
        if w.user_id != user_id:
            continue

        # find max weight for this exercise in this workout
        best = None
        for ex in w.exercises:
            if ex.exercise_name.lower() == ex_name.lower():
                best = ex.weight if best is None else max(best, ex.weight)

        if best is None:
            continue

        if w.workout_date in per_date_max:
            per_date_max[w.workout_date] = max(per_date_max[w.workout_date], best)
        else:
            per_date_max[w.workout_date] = best

    # Build sorted time series
    points: List[ProgressPoint] = [
        ProgressPoint(date=d, weight=per_date_max[d])
        for d in sorted(per_date_max.keys())
    ]

    if not points:
        raise HTTPException(
            status_code=404,
            detail="No matching exercise entries found for that user"
        )

    first_weight = points[0].weight
    last_weight = points[-1].weight
    change = last_weight - first_weight
    percent_change = None
    if first_weight > 0:
        percent_change = (change / first_weight) * 100.0

    return WeightProgressResponse(
        user_id=user_id,
        exercise_name=ex_name,
        points=points,
        first_weight=first_weight,
        last_weight=last_weight,
        change=change,
        percent_change=percent_change,
    )