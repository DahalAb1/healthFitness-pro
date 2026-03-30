"""HTTP client for the FatSecret food/nutrition database.

Primary:  OAuth 2.0 direct to platform.fatsecret.com (requires IP whitelist)
Fallback: OAuth 1.0a direct to platform.fatsecret.com (signature-based,
          no IP whitelist required — works from any machine)
"""

import logging
import httpx
from core.config import settings
from services.nutrition_oauth import get_bearer_token, build_oauth1_url
from services.nutrition_normalizers import normalize_food_summary, normalize_food_detail

logger = logging.getLogger(__name__)

_API_URL = "https://platform.fatsecret.com/rest/server.api"

# FatSecret error code 21 = IP not whitelisted for OAuth 2.0
_IP_BLOCKED_CODE = 21


class NutritionClient:

    def _get(self, params: dict) -> dict:
        """
        Try OAuth 2.0 (direct). If FatSecret rejects the IP, automatically
        retry using OAuth 1.0a via RapidAPI.
        """
        data = self._get_oauth2(params)

        if isinstance(data.get("error"), dict) and data["error"].get("code") == _IP_BLOCKED_CODE:
            data = self._get_oauth1(params)

        if "error" in data:
            err = data["error"]
            raise ValueError(
                f"FatSecret error {err.get('code')}: {err.get('message')}"
            )
        return data

    def _get_oauth2(self, params: dict) -> dict:
        """OAuth 2.0: bearer token, direct to FatSecret."""
        logger.info("Nutrition: trying OAuth 2.0 (direct)")
        headers = {"Authorization": f"Bearer {get_bearer_token()}"}
        r = httpx.get(_API_URL, headers=headers, params=params)
        r.raise_for_status()
        return r.json()

    def _get_oauth1(self, params: dict) -> dict:
        """OAuth 1.0a: HMAC-SHA1 signed, direct to FatSecret.

        No IP whitelist is required for OAuth 1.0a — authentication is
        purely signature-based, so this works from any machine.
        """
        logger.info("Nutrition: OAuth 2.0 IP blocked — falling back to OAuth 1.0a (direct)")
        signed_url = build_oauth1_url(params, _API_URL)
        r = httpx.get(signed_url)
        r.raise_for_status()
        return r.json()

    def search_foods(self, query: str, page: int = 0, max_results: int = 20) -> dict:
        """Search for foods by name. Returns a paginated list with calorie/macro summaries."""
        params = {
            "method": "foods.search",
            "search_expression": query,
            "format": "json",
            "page_number": page,
            "max_results": max_results,
        }
        data = self._get(params)

        # FatSecret wraps results: {"foods": {"food": [...], "total_results": "N", ...}}
        foods_wrapper = data.get("foods", {})
        raw_foods = foods_wrapper.get("food", [])

        # API returns a dict (not list) when only one result comes back
        if isinstance(raw_foods, dict):
            raw_foods = [raw_foods]

        return {
            "total_results": int(foods_wrapper.get("total_results", len(raw_foods))),
            "page_number": page,
            "max_results": max_results,
            "foods": [normalize_food_summary(f) for f in raw_foods],
        }

    def get_food_by_id(self, food_id: str) -> dict:
        """Fetch full nutritional details for a single food item by its FatSecret ID."""
        params = {
            "method": "food.get.v4",
            "food_id": food_id,
            "format": "json",
        }
        data = self._get(params)
        return normalize_food_detail(data.get("food", {}))

