"""Nutrition routes – food search and detailed macro lookup via FatSecret (RapidAPI)."""

import httpx
from fastapi import APIRouter, HTTPException, Query

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
