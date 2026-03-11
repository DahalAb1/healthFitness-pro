# Backend Overview — HealthFitnessPro

A complete walkthrough of how data moves through the backend, what every class and function does, and where OOP principles are followed or broken.

---

## 1. Data Flow Overview

The backend has **three distinct data flows**. Understanding these first makes the rest of the codebase click.

### Flow A — Exercise Library (External API → Frontend)

```
  ExerciseDB (RapidAPI)
        │
        ▼
  exercise_client.py         ← ExerciseClient class talks to the external API
        │
        ▼
  main.py                    ← Routes receive requests, call ExerciseClient,
  (normalize, resolve,         normalize messy API responses into clean dicts
   filter by muscle)
        │
        ▼
  FastAPI endpoints           ← GET /exercises, GET /exercises/{id},
  (JSON responses)              GET /templates/{id}/exercises
        │
        ▼
  script.js                  ← Frontend JS consumes these endpoints
        │
        ▼
  index.html                 ← User sees exercises, images, details
```

**What happens:** The frontend asks for exercises. `main.py` calls `ExerciseClient`, which hits the RapidAPI ExerciseDB. The raw API response comes back in unpredictable shapes, so helper functions (`normalize_exercise_payload`, `resolve_exercise`) clean it up into a consistent format before sending it to the frontend.

### Flow B — Workout History (Frontend → SQLite)

```
  script.js                  ← User logs a workout
        │
        ▼
  workout_routes.py          ← POST /workouts, POST /workouts/sessions, etc.
        │
        ▼
  workout_store.py           ← Raw sqlite3 — inserts/reads from DB
        │
        ▼
  workout_history.db         ← SQLite file (exercises stored as JSON string)
```

**What happens:** The user logs exercises through the frontend. `script.js` sends a POST request. `workout_routes.py` validates the data using Pydantic models from `models.py`, then hands it off to `workout_store.py` which writes directly to SQLite. No external API involved.

### Flow C — Custom Workouts (Frontend → SQLite)

```
  script.js                  ← User creates/saves a custom workout
        │
        ▼
  custom_workout/
    workout_routes.py        ← POST /user-workouts, GET, DELETE
        │
        ▼
  custom_workout/
    saved_workouts_store.py  ← Raw sqlite3 — inserts/reads from DB
        │
        ▼
  user_workouts.db           ← SQLite file (exercises stored as JSON string)
```

**What happens:** Same pattern as Flow B but for user-created workout plans (not logged sessions). Has a cap of 10 workouts per user — oldest gets auto-deleted.

### Flow D — Progress Tracking (SQLite → Computed Stats → Frontend)

```
  workout_history.db         ← Reads existing logged workouts
        │
        ▼
  workout_store.py           ← Scans all sessions, computes max weight per date
        │
        ▼
  progress_routes.py         ← GET /progress/weights — builds time series
        │
        ▼
  script.js → index.html     ← Frontend shows weight progression chart
```

### Flow E — Workout Templates (Seeded DB + API enrichment)

```
  main.py seed_templates()   ← Seeds 3 default templates on first startup
        │
        ▼
  templates_database/
    template_db.py           ← SQLAlchemy ORM — stores templates in SQLite
        │
        ▼
  templates.db               ← SQLite file (proper relational tables)
        │
        ▼
  main.py endpoints          ← GET /templates, GET /templates/{id}/exercises
  (enriches with real           calls ExerciseClient to get real exercise data
   exercise data from API)      for each template exercise
        │
        ▼
  script.js → index.html
```

---

## 2. File-by-File Breakdown (Grouped by Data Flow Role)

Files are ordered by their role in the data pipeline: **external API layer → central routing/logic → persistence → data models**.

---

### 2.1 External API Layer

#### `exercise_client.py` — ExerciseDB API Client

**Role in flow:** The single point of contact with the external ExerciseDB API (RapidAPI). Every exercise lookup in the app ultimately goes through this class.

| # | Name | Type | Line | What It Does |
|---|------|------|------|-------------|
| 1 | `ExerciseClient` | **Class** | 8 | Wraps all HTTP calls to the ExerciseDB RapidAPI. Holds API key and host in headers. |
| 2 | `__init__(self)` | Method | 12 | Reads `XRAPID_API_KEY` from `.env`, builds request headers. |
| 3 | `_extract_list(self, data)` | Method | 18 | Handles the API returning data in different shapes (plain list, `{"data": [...]}`, `{"exercises": [...]}`, nested combos). Returns a flat list no matter what. |
| 4 | `get_exercises(self, body_part, limit)` | Method | 41 | Fetches up to `limit` exercises, optionally filtered by body part. Always fetches 50 from the API, then filters/slices locally. |
| 5 | `get_exercise_by_id(self, exercise_id)` | Method | 57 | Fetches a single exercise by its ID. Returns raw JSON dict. |
| 6 | `find_exercise_by_name(self, exercise_name)` | Method | 62 | Searches by name — tries exact match first, then fuzzy substring match. Has its own response-parsing logic separate from `_extract_list`. |

**OOP Notes:**
- This is the **best-structured file** in the backend. Single class, single responsibility, clean interface.
- `find_exercise_by_name` (line 62) **duplicates** response-parsing logic instead of reusing `_extract_list`. Lines 73-78 manually check `data.get("data")` — the exact thing `_extract_list` was built to handle.
- The class is **hard-instantiated** in `main.py` line 55 (`client = ExerciseClient()`). This makes it impossible to swap in a mock for testing. Should be injected via FastAPI's `Depends()`.

---

### 2.2 Central Routing & Business Logic

#### `main.py` — Application Entry Point + Routes + Logic + Config + Seeding

**Role in flow:** Boots the server, seeds the template DB, mounts all routers, defines template/exercise endpoints, and contains all the business logic for transforming API data.

**Startup Sequence (runs on import):**

| # | Name | Type | Line | What It Does |
|---|------|------|------|-------------|
| 1 | `Base.metadata.create_all(...)` | Statement | 16 | Creates SQLAlchemy tables for the template DB if they don't exist. |
| 2 | `seed_templates()` | Function | 19 | Checks if the template DB is empty. If so, creates 3 default templates ("Push Day", "Pull Day", "Leg Day") with hardcoded exercises. Called immediately at line 39. |
| 3 | `app = FastAPI()` | Statement | 41 | Creates the FastAPI application instance. |
| 4 | `app.include_router(...)` | Statements | 44-46 | Mounts 3 routers: `custom_workout_router`, `workout_history_router`, `progress_router`. |
| 5 | `app.add_middleware(CORSMiddleware, ...)` | Statement | 48-53 | Allows all origins (`"*"`), methods GET/POST/DELETE, all headers. |
| 6 | `client = ExerciseClient()` | Statement | 55 | Hard-instantiates the API client as a module-level global. |

**Constants (hardcoded config data):**

| # | Name | Type | Line | What It Does |
|---|------|------|------|-------------|
| 7 | `LOCAL_EXERCISE_FALLBACKS` | Dict | 57-67 | Maps 9 exercise names to local metadata (target muscle, equipment, aliases). Used as a safety net when the API can't find an exercise. |
| 8 | `TEMPLATE_MUSCLE_FILTERS` | Dict | 69-88 | Maps template names ("push day", "pull day", "leg day") to muscle-matching keywords, target sets/reps, and max exercise count. Drives the template enrichment logic. |

**Pydantic Models (defined here instead of `models.py`):**

| # | Name | Type | Line | What It Does |
|---|------|------|------|-------------|
| 9 | `ExerciseEntry` | Class | 99-102 | Schema for a template exercise: `exercise_id`, `target_sets`, `target_reps`. **Not the same** as `models.ExerciseEntry` (line 8 in models.py) which is for workout history. Same name, different fields, different file. |
| 10 | `TemplateCreate` | Class | 105-108 | Schema for creating a new template: `name`, `description`, `exercises`. |

**Helper Functions (business logic):**

| # | Name | Type | Line | What It Does |
|---|------|------|------|-------------|
| 11 | `get_db()` | Function | 91-96 | FastAPI dependency — yields a SQLAlchemy session, closes it after the request. |
| 12 | `normalize_exercise_payload(payload, fallback_name)` | Function | 111-138 | Takes a raw API response dict (which can be shaped many ways) and extracts a clean, consistent dict with `id`, `name`, `target`, `equipment`, `instructions`, `gifUrl`. |
| 13 | `resolve_exercise(exercise_ref)` | Function | 141-177 | Resolves an exercise reference (name or ID) into full details. Tries: API by ID → API by name → aliases from fallbacks → pure local fallback. ~37 lines of nested if/else. |
| 14 | `collect_target_muscle_text(exercise)` | Function | 180-182 | Joins `targetMuscles` list into a lowercase string for keyword matching. |
| 15 | `collect_secondary_muscle_text(exercise)` | Function | 185-187 | Same as above but for `secondaryMuscles`. |
| 16 | `get_real_exercises_for_template(template_name)` | Function | 190-255 | The big one. Fetches 100 exercises from the API, filters for strength exercises matching the template's muscle keywords, normalizes each, and returns up to `max_exercises`. Contains two nested helper functions inside it. |
| 16a | `find_matching_muscle(exercise)` | Nested function | 199-210 | (Inside `get_real_exercises_for_template`) Checks if an exercise's target or secondary muscles match the template's keywords. |
| 16b | `add_exercise(exercise)` | Nested function | 212-232 | (Inside `get_real_exercises_for_template`) Normalizes an exercise, deduplicates by ID, builds the output dict. |

**Route Handlers (endpoints defined directly on `app`):**

| # | Name | Type | Line | Endpoint | What It Does |
|---|------|------|------|----------|-------------|
| 17 | `get_exercises(bodyPart)` | Route | 258-260 | `GET /exercises` | Returns exercises from the API, optionally filtered by body part. |
| 18 | `get_exercise(exercise_id)` | Route | 263-265 | `GET /exercises/{exercise_id}` | Returns full details for one exercise via `resolve_exercise`. |
| 19 | `list_templates(db)` | Route | 268-282 | `GET /templates` | Returns all templates from the DB, serialized to dicts. |
| 20 | `get_template(template_id, db)` | Route | 285-298 | `GET /templates/{template_id}` | Returns one template by ID. |
| 21 | `get_template_exercises(template_id, db)` | Route | 301-331 | `GET /templates/{template_id}/exercises` | The richest endpoint — gets a template from DB, then enriches each exercise with real API data (images, instructions, etc). Falls back to `resolve_exercise` per-exercise if bulk matching fails. |
| 22 | `post_template(template, db)` | Route | 334-346 | `POST /templates` | Creates a new template in the DB. |

**OOP Notes:**
- **SRP violation (severe):** This one file does 5 distinct jobs — routing, business logic, data constants, Pydantic schemas, and database seeding. Each should be its own module.
- **Template serialization is copy-pasted 3 times** — lines 271-282, 290-298, and 338-346 all contain the same dict comprehension converting a template ORM object to a dict. Should be one `serialize_template(t)` function.
- **Two `ExerciseEntry` classes exist with the same name** — one in `main.py:99` (for templates), one in `models.py:8` (for workouts). Different fields, same name. Confusing.
- `resolve_exercise` (line 141) is a ~37-line if/else chain that's hard to extend or test. Should be broken into smaller functions or use a strategy pattern.
- `LOCAL_EXERCISE_FALLBACKS` and `TEMPLATE_MUSCLE_FILTERS` are configuration data, not logic. Should live in a config file or separate module.

---

### 2.3 Route Handlers (Mounted Routers)

#### `workout_routes.py` — Workout History Endpoints

**Role in flow:** Receives HTTP requests for logging and viewing workout sessions. Validates input with Pydantic, delegates persistence to `workout_store.py`.

| # | Name | Type | Line | Endpoint | What It Does |
|---|------|------|------|----------|-------------|
| 1 | `router` | APIRouter | 7 | — | FastAPI router, mounted in `main.py` line 45. |
| 2 | `start_workout_session(payload)` | Route | 10-13 | `POST /workouts/sessions` | Creates a session with no exercises (two-step logging). |
| 3 | `log_exercises(workout_id, payload)` | Route | 16-22 | `POST /workouts/sessions/{id}/exercises` | Appends exercises to an existing session. |
| 4 | `get_workout_details_by_date(user_id, workout_date)` | Route | 25-31 | `GET /workouts/details` | Looks up a workout by user + date combo. |
| 5 | `create_workout(workout)` | Route | 34-49 | `POST /workouts` | One-step creation — internally calls `create_session` then `append_exercises`. |
| 6 | `get_workouts(user_id)` | Route | 52-54 | `GET /workouts` | Lists all sessions, optionally filtered by user. |
| 7 | `get_workout_by_id(workout_id)` | Route | 57-62 | `GET /workouts/{workout_id}` | Returns a single session by ID. |

**OOP Notes:**
- Clean and well-structured. Routes are thin — they validate and delegate.
- `create_workout` (line 34) nicely reuses the two-step flow internally. Good pattern.

---

#### `progress_routes.py` — Progress Tracking Endpoint

**Role in flow:** Reads workout history and computes weight progression stats for a specific exercise over time.

| # | Name | Type | Line | Endpoint | What It Does |
|---|------|------|------|----------|-------------|
| 1 | `router` | APIRouter | 7 | — | FastAPI router, mounted in `main.py` line 46. |
| 2 | `get_weight_progress(user_id, exercise_name)` | Route | 10-51 | `GET /progress/weights` | Validates input, calls `workout_store.get_weight_progress_points()`, builds a sorted time series of `ProgressPoint` objects, computes first/last/change/percent_change stats. |

**OOP Notes:**
- Clean. Single endpoint, clear logic.
- The **stats computation** (lines 36-41: first_weight, last_weight, change, percent_change) is business logic living inside a route handler. Minor — could be extracted if progress features grow.

---

#### `custom_workout/workout_routes.py` — Custom Workout Endpoints

**Role in flow:** CRUD for user-created workout plans. Delegates to `saved_workouts_store.py`.

| # | Name | Type | Line | Endpoint | What It Does |
|---|------|------|------|----------|-------------|
| 1 | `router` | APIRouter | 6 | — | FastAPI router, mounted in `main.py` line 44. |
| 2 | `MAX_USER_WORKOUTS` | Constant | 8 | — | Cap of 10 custom workouts per user. |
| 3 | `create_user_workout(workout)` | Route | 11-16 | `POST /user-workouts` | Creates a custom workout. Passes `max_per_user` to the store. |
| 4 | `get_user_workouts(user_id)` | Route | 19-23 | `GET /user-workouts` | Lists all or user-filtered custom workouts. |
| 5 | `delete_user_workout(workout_id, user_id)` | Route | 26-31 | `DELETE /user-workouts/{workout_id}` | Deletes a custom workout by ID + user_id. |

**OOP Notes:**
- Clean and thin.

---

### 2.4 Persistence Layer

#### `workout_store.py` — Workout History Persistence (Raw sqlite3)

**Role in flow:** All reads and writes to `workout_history.db`. Used by both `workout_routes.py` and `progress_routes.py`.

| # | Name | Type | Line | What It Does |
|---|------|------|------|-------------|
| 1 | `_DB_PATH` | Constant | 9 | Path to `workout_history.db`. |
| 2 | `_connect()` | Function | 12-15 | Opens a sqlite3 connection with `Row` factory for dict-like access. |
| 3 | `init_db()` | Function | 18-35 | Creates the `workout_sessions` table and index if they don't exist. |
| 4 | `_row_to_session(row)` | Function | 38-48 | Converts a sqlite3 `Row` into a Pydantic `WorkoutSession`. Parses `exercises_json` from string back into `ExerciseEntry` objects. |
| 5 | `create_session(payload)` | Function | 51-67 | INSERTs a new session with empty exercises. Calls `init_db()` first. |
| 6 | `append_exercises(workout_id, payload)` | Function | 70-92 | Reads current `exercises_json`, appends new entries, UPDATEs the row. Calls `init_db()` first. |
| 7 | `get_by_id(workout_id)` | Function | 95-104 | SELECTs a session by ID. Calls `init_db()` first. |
| 8 | `list_sessions(user_id)` | Function | 107-120 | SELECTs all sessions (or filtered by user). Calls `init_db()` first. |
| 9 | `get_by_date(user_id, workout_date)` | Function | 123-135 | SELECTs the most recent session for a user+date. Calls `init_db()` first. |
| 10 | `get_weight_progress_points(user_id, exercise_name)` | Function | 138-161 | Loads **all** sessions for a user, iterates every exercise, computes max weight per date. Returns `{date_string: max_weight}`. |

**OOP Notes:**
- **`init_db()` is called inside every function** (lines 52, 71, 96, 108, 124) — the table-creation check runs on every single DB call. Should be called once at startup.
- **Uses raw sqlite3** while `template_db.py` uses SQLAlchemy. Two different DB approaches in the same project — inconsistent and confusing.
- `get_weight_progress_points` (line 138) loads ALL sessions into memory to compute stats. Not scalable — should use a SQL query with aggregation.
- No class structure — just loose functions. Could be a `WorkoutStore` class with `_connect` and `init_db` called once in `__init__`.
- `_row_to_session` is a good pattern (single place for row→model conversion). Compare with `saved_workouts_store.py` which copy-pastes this instead.

---

#### `custom_workout/saved_workouts_store.py` — Custom Workout Persistence (Raw sqlite3)

**Role in flow:** All reads and writes to `user_workouts.db`. Includes JSON→SQLite migration support.

| # | Name | Type | Line | What It Does |
|---|------|------|------|-------------|
| 1 | `DB_PATH` | Constant | 7 | Path to `user_workouts.db`. |
| 2 | `OLD_JSON` | Constant | 8 | Path to legacy `user_workouts_store.json` (for migration). |
| 3 | `_lock` | Lock | 9 | Threading lock for concurrent access. |
| 4 | `_conn()` | Function | 12-13 | Opens a sqlite3 connection. No Row factory (uses tuple indexing). |
| 5 | `init_db()` | Function | 16-54 | Creates the `workouts` table. If the DB is empty and an old JSON file exists, migrates data from JSON into SQLite. |
| 6 | `add_workout(workout_dict, max_per_user)` | Function | 57-87 | INSERTs a workout. If user already has `max_per_user` workouts, deletes the oldest first. Returns the new row as a dict. |
| 7 | `list_workouts()` | Function | 90-107 | SELECTs all workouts, converts each row to a dict. |
| 8 | `list_workouts_for_user(user_id)` | Function | 110-127 | SELECTs workouts for one user, converts each row to a dict. |
| 9 | `delete_workout(workout_id, user_id)` | Function | 130-139 | DELETEs a workout by ID + user_id. Returns bool. |

**OOP Notes:**
- **Row-to-dict mapping is copy-pasted 3 times** — lines 81-87 (in `add_workout`), 100-106 (in `list_workouts`), and 118-126 (in `list_workouts_for_user`). All do the same `row[0], row[1], ...` conversion. Should be a single `_row_to_dict(row)` helper (like `workout_store.py`'s `_row_to_session`).
- **`init_db()` called in every function** — same problem as `workout_store.py`.
- Uses **tuple indexing** (`row[0]`, `row[1]`) instead of `sqlite3.Row` — fragile. If columns change order, everything breaks silently.
- No class structure — same as `workout_store.py`. Loose functions with module-level state.
- The threading lock wraps entire functions including `init_db()` — could cause unnecessary contention.

---

#### `templates_database/template_db.py` — Template Persistence (SQLAlchemy ORM)

**Role in flow:** Manages the `templates.db` database using SQLAlchemy. The only file with proper ORM usage.

| # | Name | Type | Line | What It Does |
|---|------|------|------|-------------|
| 1 | `engine` | Engine | 6 | SQLAlchemy engine pointing to `templates.db`. |
| 2 | `SessionLocal` | Session factory | 7 | Creates DB sessions. |
| 3 | `Base` | Declarative base | 8 | SQLAlchemy base class for ORM models. |
| 4 | `WorkoutTemplate` | **ORM Class** | 11-20 | Maps to `workout_templates` table. Columns: `id`, `name`, `description`. Has a one-to-many relationship to `TemplateExercise`. |
| 5 | `TemplateExercise` | **ORM Class** | 23-32 | Maps to `template_exercises` table. Columns: `id`, `template_id` (FK), `exercise_id`, `target_sets`, `target_reps`. Back-populates to `WorkoutTemplate`. |
| 6 | `get_all_templates(db)` | Function | 37-38 | Queries all templates. |
| 7 | `get_template_by_id(db, template_id)` | Function | 41-42 | Queries one template by ID. |
| 8 | `create_template(db, name, description, exercises)` | Function | 45-58 | Creates a template with its exercises in one transaction. Properly uses relationships and `db.commit()`. |

**OOP Notes:**
- **Best-structured persistence file.** Uses SQLAlchemy ORM properly — models, relationships, cascading deletes.
- CRUD functions take `db` as a parameter (dependency injection). The other stores don't do this.
- Could benefit from a Repository class pattern, but it's clean as-is.
- This is the pattern the other two stores (`workout_store.py`, `saved_workouts_store.py`) should follow.

---

### 2.5 Data Validation Layer

#### `models.py` — All Pydantic Schemas

**Role in flow:** Defines the shape and validation rules for all request/response data. Used by routes and stores for input validation and serialization.

**Workout History Models:**

| # | Name | Type | Line | What It Does |
|---|------|------|------|-------------|
| 1 | `ExerciseEntry` | Pydantic Model | 8-22 | A single logged exercise: `exercise_name` (1-80 chars), `sets` (1-50), `reps` (1-200), `weight` (0-2000). Has a field validator that strips whitespace from `exercise_name`. |
| 2 | `WorkoutBase` | Pydantic Model | 25-31 | Base workout data: `user_id` (≥1), `workout_date`, `duration_minutes` (1-600), `exercises` (list, can be empty). |
| 3 | `WorkoutCreate` | Pydantic Model | 35-36 | Extends `WorkoutBase` — overrides `exercises` to require at least 1 entry. |
| 4 | `WorkoutSession` | Pydantic Model | 38-39 | Extends `WorkoutBase` + adds `id`. Represents a stored workout. |
| 5 | `WorkoutSessionStart` | Pydantic Model | 41-45 | For starting a session without exercises: `user_id`, `workout_date`, `duration_minutes`. |
| 6 | `ExerciseLogCreate` | Pydantic Model | 47-49 | For appending exercises to a session: `exercises` list (min 1). |

**Exercise Library Models:**

| # | Name | Type | Line | What It Does |
|---|------|------|------|-------------|
| 7 | `Exercise` | Pydantic Model | 54-60 | Exercise definition: `id`, `name`, `muscle_group`, `equipment`, `description` (list of strings), `image_url`. |
| 8 | `ExerciseListResponse` | Pydantic Model | 63-64 | Wrapper: `exercises` list. |

**Progress Models:**

| # | Name | Type | Line | What It Does |
|---|------|------|------|-------------|
| 9 | `ProgressPoint` | Pydantic Model | 67-69 | Single data point: `date`, `weight`. |
| 10 | `WeightProgressResponse` | Pydantic Model | 71-78 | Full progress response: `user_id`, `exercise_name`, `points`, `first_weight`, `last_weight`, `change`, `percent_change`. |

**Custom Workout Models:**

| # | Name | Type | Line | What It Does |
|---|------|------|------|-------------|
| 11 | `CustomWorkoutExercise` | Pydantic Model | 81-87 | Exercise in a custom workout: `exercise_id` (optional), `exercise_name`, `sets`, `reps`, `weight` (optional). |
| 12 | `UserWorkoutCreate` | Pydantic Model | 89-95 | Create a custom workout: `user_id`, `name`, `main_muscle`, `difficulty`, `duration_minutes`, `exercises`. |
| 13 | `UserWorkout` | Pydantic Model | 98-99 | Extends `UserWorkoutCreate` + adds `id`. |

**OOP Notes:**
- Good use of Pydantic inheritance (`WorkoutCreate` extends `WorkoutBase`, `UserWorkout` extends `UserWorkoutCreate`).
- Uses `ConfigDict(extra="forbid")` on workout models to reject unexpected fields — proper validation.
- **Naming collision:** `ExerciseEntry` exists here (line 8, for workout history) AND in `main.py` (line 99, for templates). They have completely different fields. This is confusing and error-prone.

---

## 3. All Endpoints (16 Total)

| # | Method | Path | Source File | Description |
|---|--------|------|-------------|-------------|
| 1 | GET | `/exercises` | `main.py:258` | List exercises from ExerciseDB API |
| 2 | GET | `/exercises/{exercise_id}` | `main.py:263` | Get single exercise details |
| 3 | GET | `/templates` | `main.py:268` | List all workout templates |
| 4 | GET | `/templates/{template_id}` | `main.py:285` | Get one template by ID |
| 5 | GET | `/templates/{template_id}/exercises` | `main.py:301` | Get real exercises for a template (API-enriched) |
| 6 | POST | `/templates` | `main.py:334` | Create a new template |
| 7 | POST | `/workouts/sessions` | `workout_routes.py:10` | Start a session (no exercises yet) |
| 8 | POST | `/workouts/sessions/{id}/exercises` | `workout_routes.py:16` | Append exercises to a session |
| 9 | GET | `/workouts/details` | `workout_routes.py:25` | Get workout by user + date |
| 10 | POST | `/workouts` | `workout_routes.py:34` | Create full workout (one step) |
| 11 | GET | `/workouts` | `workout_routes.py:52` | List all workouts (optional user filter) |
| 12 | GET | `/workouts/{workout_id}` | `workout_routes.py:57` | Get workout by ID |
| 13 | GET | `/progress/weights` | `progress_routes.py:10` | Weight progression for an exercise |
| 14 | POST | `/user-workouts` | `custom_workout/workout_routes.py:11` | Create a custom workout |
| 15 | GET | `/user-workouts` | `custom_workout/workout_routes.py:19` | List custom workouts |
| 16 | DELETE | `/user-workouts/{workout_id}` | `custom_workout/workout_routes.py:26` | Delete a custom workout |

---

## 4. Storage Summary

| Database | File That Manages It | ORM | Tables |
|----------|---------------------|-----|--------|
| `templates.db` | `templates_database/template_db.py` | SQLAlchemy | `workout_templates`, `template_exercises` |
| `workout_history.db` | `workout_store.py` | Raw sqlite3 | `workout_sessions` |
| `user_workouts.db` | `custom_workout/saved_workouts_store.py` | Raw sqlite3 | `workouts` |

---

## 5. Issues, Redundancies & Cleanup Notes

This is the consolidated list of everything that violates OOP principles, is duplicated, or needs refactoring. Ordered by severity.

### High Priority

| # | Issue | Where | What to Do |
|---|-------|-------|------------|
| 1 | **`main.py` does 5 jobs (SRP violation)** | `main.py` — all 347 lines | Split into: `config.py` (constants), `schemas.py` (Pydantic models), `seed.py` (template seeding), `exercise_service.py` (resolve/normalize logic), keep only route definitions in `main.py`. |
| 2 | **Template serialization copy-pasted 3×** | `main.py:271-282`, `main.py:290-298`, `main.py:338-346` | Extract a single `serialize_template(t)` function. |
| 3 | **Row-to-dict mapping copy-pasted 3×** | `saved_workouts_store.py:81-87`, `saved_workouts_store.py:100-106`, `saved_workouts_store.py:118-126` | Extract a `_row_to_dict(row)` helper function (like `workout_store.py` already does with `_row_to_session`). |
| 4 | **Two different DB approaches** | `template_db.py` uses SQLAlchemy; `workout_store.py` and `saved_workouts_store.py` use raw sqlite3 | Pick one. Either migrate everything to SQLAlchemy (recommended) or everything to raw sqlite3. |
| 5 | **`init_db()` called on every function** | `workout_store.py:52,71,96,108,124` and `saved_workouts_store.py:58,91,111,131` | Call once at startup in `main.py`. Remove from individual functions. |

### Medium Priority

| # | Issue | Where | What to Do |
|---|-------|-------|------------|
| 6 | **Duplicate `ExerciseEntry` class name** | `main.py:99` and `models.py:8` — same name, different fields | Rename the one in `main.py` to `TemplateExerciseEntry` or move it to `models.py`. |
| 7 | **`resolve_exercise` is a long if/else chain** | `main.py:141-177` | Break into smaller functions: `_try_by_id()`, `_try_by_name()`, `_try_aliases()`, `_local_fallback()`. |
| 8 | **`ExerciseClient` not injectable** | `main.py:55` (hard-instantiated) | Use FastAPI `Depends()` so it can be mocked in tests. |
| 9 | **`find_exercise_by_name` duplicates `_extract_list` logic** | `exercise_client.py:73-78` vs `exercise_client.py:18-39` | Reuse `_extract_list` inside `find_exercise_by_name`. |
| 10 | **Persistence layers have no class structure** | `workout_store.py`, `saved_workouts_store.py` | Wrap in classes (`WorkoutStore`, `SavedWorkoutsStore`) with connection setup in `__init__`. |

### Low Priority

| # | Issue | Where | What to Do |
|---|-------|-------|------------|
| 11 | **CORS allows all origins** | `main.py:50` | Read allowed origins from `.env` for production. |
| 12 | **Config data hardcoded** | `main.py:57-88` (`LOCAL_EXERCISE_FALLBACKS`, `TEMPLATE_MUSCLE_FILTERS`) | Move to a `config.py` or JSON/YAML file. |
| 13 | **Tuple indexing instead of Row factory** | `saved_workouts_store.py` (`row[0]`, `row[1]`, etc.) | Use `sqlite3.Row` factory like `workout_store.py` does, so columns are accessed by name. |
| 14 | **No pagination on list endpoints** | `GET /workouts`, `GET /user-workouts`, `GET /templates` | Add `limit`/`offset` query parameters. |
| 15 | **Progress computation loads all sessions into memory** | `workout_store.py:138-161` | Use a SQL `GROUP BY` + `MAX()` query instead of Python iteration. |

---

## 6. File Dependency Map (Visual)

```
main.py  ─────────────────────────────────────────────────────────────
│
├── exercise_client.py ................ ExerciseClient (→ RapidAPI)
│
├── templates_database/
│   └── template_db.py ............... SQLAlchemy ORM + CRUD
│       └── templates.db
│
├── workout_routes.py ................ Router (mounted)
│   └── workout_store.py ............. Raw sqlite3 persistence
│       ├── models.py ................ Pydantic schemas
│       └── workout_history.db
│
├── progress_routes.py ............... Router (mounted)
│   └── workout_store.py ............. (same store as above)
│       └── models.py
│
└── custom_workout/
    └── workout_routes.py ............ Router (mounted)
        └── saved_workouts_store.py .. Raw sqlite3 persistence
            └── user_workouts.db

models.py ............................ Standalone (no internal deps)
```
