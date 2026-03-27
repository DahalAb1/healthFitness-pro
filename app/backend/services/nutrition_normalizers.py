"""Normalization helpers for FatSecret API responses."""


def normalize_food_summary(food: dict) -> dict:
    """
    Convert a search-result food entry into a consistent shape.
    FatSecret encodes per-serving macros in a human-readable description string:
        "Per 100g - Calories: 165kcal | Fat: 3.57g | Carbs: 0g | Protein: 31.02g"
    """
    macros = _parse_description_macros(food.get("food_description", ""))
    return {
        "food_id": food.get("food_id", ""),
        "food_name": food.get("food_name", ""),
        "food_type": food.get("food_type", ""),
        "brand_name": food.get("brand_name", ""),
        "calories": macros.get("calories"),
        "fat_g": macros.get("fat"),
        "carbs_g": macros.get("carbs"),
        "protein_g": macros.get("protein"),
        "serving_description": macros.get("serving_description", ""),
    }


def normalize_food_detail(food: dict) -> dict:
    """
    Flatten the nested servings structure returned by food.get.v4.
    Returns the food's name, ID, and a list of all available servings.
    """
    servings_wrapper = food.get("servings", {})
    raw_servings = servings_wrapper.get("serving", [])
    if isinstance(raw_servings, dict):
        raw_servings = [raw_servings]

    servings = []
    for s in raw_servings:
        servings.append({
            "serving_id": s.get("serving_id", ""),
            "serving_description": s.get("serving_description", ""),
            "metric_serving_amount": s.get("metric_serving_amount"),
            "metric_serving_unit": s.get("metric_serving_unit", ""),
            "calories": _safe_float(s.get("calories")),
            "fat_g": _safe_float(s.get("fat")),
            "saturated_fat_g": _safe_float(s.get("saturated_fat")),
            "carbs_g": _safe_float(s.get("carbohydrate")),
            "fiber_g": _safe_float(s.get("fiber")),
            "sugar_g": _safe_float(s.get("sugar")),
            "protein_g": _safe_float(s.get("protein")),
            "sodium_mg": _safe_float(s.get("sodium")),
        })

    return {
        "food_id": food.get("food_id", ""),
        "food_name": food.get("food_name", ""),
        "food_type": food.get("food_type", ""),
        "brand_name": food.get("brand_name", ""),
        "food_url": food.get("food_url", ""),
        "servings": servings,
    }


def _safe_float(value) -> float | None:
    """Convert a string or number to float, returning None on failure."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _parse_description_macros(description: str) -> dict:
    """
    Parse FatSecret's description string into structured macro values.
    Example input:
        "Per 100g - Calories: 165kcal | Fat: 3.57g | Carbs: 0g | Protein: 31.02g"
    """
    result = {}
    if not description:
        return result

    if " - " in description:
        serving_part, macro_part = description.split(" - ", 1)
        result["serving_description"] = serving_part.strip()
    else:
        macro_part = description
        result["serving_description"] = ""

    for segment in macro_part.split("|"):
        segment = segment.strip()
        if ":" not in segment:
            continue
        label, raw_value = segment.split(":", 1)
        label = label.strip().lower()
        numeric = "".join(c for c in raw_value.strip() if c.isdigit() or c == ".")
        value = _safe_float(numeric)

        if "calorie" in label:
            result["calories"] = value
        elif "fat" in label:
            result["fat"] = value
        elif "carb" in label:
            result["carbs"] = value
        elif "protein" in label:
            result["protein"] = value

    return result
