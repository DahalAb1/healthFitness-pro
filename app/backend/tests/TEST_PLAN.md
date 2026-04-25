# Backend Unit Test Plan — SCRUM-96

## Technology
- Language: Python
- Framework: pytest
- Report: pytest-html (`tests/pytest_report.html`)

---

## Test 1 — `ExerciseClient._get` returns a rate-limit dict on 429

**File:** `tests/test_exercise_client.py`
**Class/Method:** `ExerciseClient._get(url, params)` in `services/exercise_client.py`

**What it tests:**
`_get` is the single HTTP helper used by every ExerciseClient method. When RapidAPI
responds with a 429 (rate limited), `_get` must return `{"error": "rate_limit"}` instead
of crashing. If this check breaks, every endpoint that fetches exercise data breaks silently.

**Fields and return objects:**
- Input: any URL string
- Mocked response: `status_code = 429`
- Expected return: `{"error": "rate_limit"}`

---

## Test 2 — `resolve_exercise` short-circuits on rate-limit without calling name fallback

**File:** `tests/test_exercise_service.py`
**Function:** `resolve_exercise(client, exercise_ref)` in `services/exercise_service.py`

**What it tests:**
`resolve_exercise` tries to find an exercise by ID first, then falls back to a name search.
If the ID lookup is rate-limited, it must return the error immediately without making a
second API call. Without this, the code burns another request while already rate-limited.

**Fields and return objects:**
- Mocked: `client.get_exercise_by_id` returns `{"error": "rate_limit"}`
- Expected return: `{"error": "rate_limit"}`
- Verified: `client.find_exercise_by_name` is never called

---

## Test 3 — `GET /exercises/{id}` returns HTTP 503 on rate-limit

**File:** `tests/test_exercise_routes.py`
**Route:** `GET /exercises/{exercise_id}` in `api/routes/exercises.py`

**What it tests:**
The route must translate a rate-limit error into an HTTP 503 response. The frontend
checks for 503 specifically to show the rate-limit message to the user. If the status
code becomes 500 or 502 instead, the frontend error handling breaks silently.

**Fields and return objects:**
- Mocked: `resolve_exercise` returns `{"error": "rate_limit"}`
- Expected: `response.status_code == 503`
