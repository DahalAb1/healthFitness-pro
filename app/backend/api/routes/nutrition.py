"""Nutrition routes – food search, macro lookup, and per-user meal logging."""

from collections import defaultdict
from datetime import date as date_type, timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from api.deps import get_current_user, get_session
from models.nutrition import MealLog, MealLogCreate, MealLogRead
from models.user import User
from services.nutrition_client import NutritionClient

router = APIRouter(prefix="/nutrition", tags=["nutrition"])
client = NutritionClient()


@router.get("/search")
def search_foods(
    q: str = Query(..., description="Food name or description to search for"),
    page: int = Query(0, ge=0, description="Page number for pagination"),
    max_results: int = Query(20, ge=1, le=50, description="Results per page"),
):
    """
    Search for foods by name. Returns a paginated list of food items with
    per-serving calorie and macro summaries.

    Example: GET /nutrition/search?q=chicken+breast&max_results=10
    """
    try:
        return client.search_foods(query=q, page=page, max_results=max_results)
    except (httpx.HTTPStatusError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Nutrition API unreachable: {exc}")


@router.get("/food/{food_id}")
def get_food(food_id: str):
    """
    Retrieve full nutritional details for a specific food by its FatSecret ID,
    including all available serving sizes and macro breakdowns.

    Example: GET /nutrition/food/33691
    """
    try:
        return client.get_food_by_id(food_id)
    except (httpx.HTTPStatusError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail=f"Nutrition API unreachable: {exc}")


# ---------------------------------------------------------------------------
# Meal log – per-user daily food tracking stored in the database
# ---------------------------------------------------------------------------

@router.get("/logs/active-dates")
def get_active_dates(
    year: int = Query(..., ge=2000),
    month: int = Query(..., ge=1, le=12),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return a list of day numbers (1-31) that have at least one log entry
    for the authenticated user in the given year/month."""
    logs = session.exec(
        select(MealLog.log_date).where(
            MealLog.user_id == current_user.id,
            MealLog.log_date >= date_type(year, month, 1),
            MealLog.log_date < (
                date_type(year, month + 1, 1) if month < 12 else date_type(year + 1, 1, 1)
            ),
        )
    ).all()
    return {"days": sorted({d.day for d in logs})}


@router.get("/logs", response_model=list[MealLogRead])
def get_meal_logs(
    log_date: date_type = Query(..., description="Date to fetch logs for (YYYY-MM-DD)"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return all meal log entries for the authenticated user on a given date."""
    return session.exec(
        select(MealLog).where(
            MealLog.user_id == current_user.id,
            MealLog.log_date == log_date,
        )
    ).all()


@router.post("/logs", response_model=MealLogRead, status_code=201)
def add_meal_log(
    data: MealLogCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Add a food item to the authenticated user's meal log."""
    entry = MealLog(
        user_id=current_user.id,
        log_date=data.log_date,
        meal_type=data.meal_type,
        food_name=data.food_name,
        kcal=data.kcal,
        protein_g=data.protein_g,
        carbs_g=data.carbs_g,
        fat_g=data.fat_g,
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry


@router.get("/logs/trends")
def get_nutrition_trends(
    days: Optional[int] = Query(None, ge=1, description="Limit results to last N days. Omit for all time."),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return daily aggregated macro totals for the authenticated user."""
    query = select(MealLog).where(MealLog.user_id == current_user.id)
    if days is not None:
        cutoff = date_type.today() - timedelta(days=days - 1)
        query = query.where(MealLog.log_date >= cutoff)

    logs = session.exec(query).all()

    daily: dict[date_type, dict] = defaultdict(
        lambda: {"kcal": 0.0, "protein_g": 0.0, "carbs_g": 0.0, "fat_g": 0.0}
    )
    for log in logs:
        day = daily[log.log_date]
        day["kcal"] += log.kcal or 0.0
        day["protein_g"] += log.protein_g or 0.0
        day["carbs_g"] += log.carbs_g or 0.0
        day["fat_g"] += log.fat_g or 0.0

    return [
        {"date": str(d), **totals}
        for d, totals in sorted(daily.items())
    ]


@router.delete("/logs/{log_id}", status_code=204)
def delete_meal_log(
    log_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Remove a meal log entry. Only the owning user may delete their entries."""
    entry = session.get(MealLog, log_id)
    if not entry or entry.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Log entry not found")
    session.delete(entry)
    session.commit()
