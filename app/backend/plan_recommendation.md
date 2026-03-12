# Backend Issues & Refactoring Plan — HealthFitnessPro

## Why This Document Exists

This is an inventory of every problem in the backend — what's broken, why it matters, and what to focus on. The issues are grouped by type, not by file, because the same root causes show up across multiple files.

---

## Priority Order

Issues are listed by seriousness .

| Priority | What to Fix | Why First | Resolves |
|----------|------------|-----------|----------|
| 1 | Split `main.py` into separate files | One file doing 5 jobs blocks every other cleanup | 2.2, 2.7 |
| 2 | Unify database approach (pick SQLAlchemy) | Eliminates JSON columns, enables SQL queries, fixes tuple indexing | 3.1, 3.5, 4.1, 4.5 |
| 3 | Extract all duplicated code | Stops bugs from hiding in copies | 1.1–1.8 |
| 4 | Make `ExerciseClient` injectable | Unblocks testing without hitting the real API | 2.4 |
| 5 | Centralize frontend API calls | One place to update when backend changes | 1.3, 1.5, 1.8, 3.2, 3.3 |
| 6 | Add pagination | Required before any real usage | 4.2, 4.3 |

---

## 1. Duplicated Code

Code that exists in multiple places. When you fix a bug in one copy, the others still have it.

---

### 1.1 Template Serialization — 3 copies

**Where:** `main.py:271-282`, `main.py:290-298`, `main.py:338-346`

Same dict comprehension converting a template ORM object to JSON, copy-pasted into three route handlers.

**Why it's bad:** If the template schema changes, you have to update three places. Miss one, and that endpoint returns wrong data.

---

### 1.2 Row-to-Dict Mapping — 3 copies

**Where:** `saved_workouts_store.py:81-87`, `:100-106`, `:118-126`

Same `row[0], row[1], row[2]` conversion in three functions.

**Why it's bad:** If you add or reorder a column, you have to update three places. Miss one, and the data comes back wrong.

---

### 1.3 Exercise Normalization — 3 copies

**Where:** `main.py:111-138`, `script.js:57-69`, `custom_workout.js:34-52`

All three handle the ExerciseDB API returning data in unpredictable shapes and normalize it into a clean object.

**Why it's bad:** If the API changes its response format, three files need fixing independently. Miss one, and that page breaks.

---

### 1.4 `dateKeyNowInTZ()` — 2 copies

**Where:** `log_workout.js:3-12`, `calendar_script.js:43-57`

Identical timezone date function, copy-pasted.

**Why it's bad:** If there's a timezone bug, it exists in both files. Fix one, the other still has it.

---

### 1.5 Backend URL — 3 copies

**Where:** `script.js:33`, `log_workout.js:1`, `calendar_script.js:6`

Same hardcoded `http://127.0.0.1:8000`, different variable names, different files.

**Why it's bad:** Change the server address, update three files. Miss one, that page silently fails.

---

### 1.6 Fallback Exercise Data — 2 copies

**Where:** `main.py:57-67` (`LOCAL_EXERCISE_FALLBACKS`), `custom_workout.js:2-8` (`fallbackLibrary`)

Both provide backup exercise data when the API is down. Different data, different formats.

**Why it's bad:** Two different fallback datasets that can drift apart. Nobody notices until a user gets inconsistent data.

---

### 1.7 `_extract_list` Logic — duplicated within `exercise_client.py`

**Where:** `exercise_client.py:18-39` vs `:73-78`

`_extract_list` was built to handle messy API shapes. `find_exercise_by_name` does its own version instead of calling it.

**Why it's bad:** The method exists to handle this. Not using it means the same bug can exist in two places.

---

### 1.8 `custom_workout.js` Bypasses `script.js`

**Where:** `custom_workout.js:23-61` vs `script.js:39-80`

Both call `GET /exercises` and transform the response the same way. `custom_workout.js` wrote its own version instead of using `script.js`.

**Why it's bad:** Two files doing the same fetch and transform. API changes require updating both.

---

## 2. Design Faults

The code works, but these structural problems make it harder to understand, test, and extend.

---

### 2.1 `main.py` Does Five Jobs

`main.py` is 347 lines handling: database seeding, configuration constants, Pydantic schemas, business logic (normalize/resolve/filter), and 6 route handlers.

**Why it's bad:** Each job has a different reason to change. Editing normalization logic means editing the same file as route definitions. Hard to navigate, hard to review, easy to break something unrelated.

---

### 2.2 Two `ExerciseEntry` Classes, Same Name

**Where:** `models.py:8` (workout history) and `main.py:99` (templates)

Completely different fields, same class name, different files.

**Why it's bad:** Import the wrong one and it fails silently or with a confusing error.

---

### 2.3 Two Different Database Approaches

**Where:** `template_db.py` uses SQLAlchemy ORM. `workout_store.py` and `saved_workouts_store.py` use raw sqlite3.

**Why it's bad:** Two patterns to learn, two ways things can break. The raw sqlite3 files store exercises as JSON strings, preventing SQL queries. No technical reason for the split — different people built different parts.

---

### 2.4 `ExerciseClient` Is Not Injectable

**Where:** `main.py:55` — hard-instantiated as a module-level global.

**Why it's bad:** Can't mock it for testing. Every test hits the real API. FastAPI's `Depends()` was built for this.

---

### 2.5 `init_db()` Called on Every Function

**Where:** `workout_store.py:52,71,96,108,124` and `saved_workouts_store.py:58,91,111,131`

Every database function runs `CREATE TABLE IF NOT EXISTS` before doing its actual job.

**Why it's bad:** Wasteful and hides initialization inside business logic. Should run once at startup.

---

### 2.6 No Class Structure in Persistence Layers

**Where:** `workout_store.py` and `saved_workouts_store.py`

Loose functions with module-level constants. No class, no `__init__`.

**Why it's bad:** Can't inject a test database path. Can't have two stores for different databases. Compare with `template_db.py` which takes a `db` session as a parameter — clean and testable.

---

### 2.7 Hardcoded Configuration

| What | Where |
|------|-------|
| `LOCAL_EXERCISE_FALLBACKS` | `main.py:57-67` |
| `TEMPLATE_MUSCLE_FILTERS` | `main.py:69-88` |
| `CORS allow_origins=["*"]` | `main.py:50` |
| `MAX_USER_WORKOUTS = 10` | `custom_workout/workout_routes.py:8` |
| `user_id: 1` | `custom_workout.js`, `active_workout.js` |

Changing any value means editing source code. CORS allowing all origins is unsafe for production.

---

## 3. Fragile / Breakable Parts

Things that will silently break or return wrong results when something changes.

---

### 3.1 Tuple Indexing in `saved_workouts_store.py`

**Where:** Lines 81-87, 100-106, 118-126

Rows accessed by position (`row[0]`, `row[1]`). Add or reorder a column, and the mapping silently returns wrong data. `workout_store.py` uses `sqlite3.Row` for name-based access — safer pattern.

---

### 3.2 API Response Shape Changes Break Three Files

*(See 1.3)* If the ExerciseDB API changes how it wraps data, `main.py`, `script.js`, and `custom_workout.js` all need independent fixes. The backend should normalize everything before sending, so the frontend never touches raw API shapes.

---

### 3.3 Server Address Change Breaks Three Files

*(See 1.5)* Backend URL hardcoded in three frontend files with different variable names.

---

### 3.4 `resolve_exercise` — 37-Line If/Else Chain

**Where:** `main.py:141-177`

Tries to resolve an exercise by ID → name → aliases → local fallback, all in one nested chain.

**Why it breaks:** Adding a new strategy means inserting more branches into an already complex chain. Can't test individual strategies in isolation.

---

### 3.5 JSON Columns Instead of Relational Tables

**Where:** `workout_store.py` and `saved_workouts_store.py` — `exercises_json` column

Exercises stored as a JSON string. Can't query at the SQL level. Want all workouts with "Bench Press"? Load everything into Python and loop. Any feature that needs exercise-level queries hits this wall.

---

## 4. Scalability Risks

Works now with small data. Won't hold up as the project grows.

---

### 4.1 Progress Query Loads Everything Into Memory

**Where:** `workout_store.py:138-161`

Loads every session for a user, parses every JSON blob, loops through every exercise to find max weight per date. With relational tables, this is one SQL query.

---

### 4.2 No Pagination

`GET /workouts`, `GET /user-workouts`, `GET /templates` all return the entire dataset. 100 users × 50 workouts = 5,000 records in one response.

---

### 4.3 Calendar Downloads Full History

**Where:** `calendar_script.js:110-124`

Loads every workout ever logged, but only displays one month. Should support a date range filter on the backend.

---

### 4.4 No User Authentication

`user_id: 1` hardcoded everywhere. No login, no tokens. The moment you need two users, everything breaks — history, custom workouts, and progress all depend on `user_id`.

---

### 4.5 JSON Columns Block Future Features

*(See 3.5)* No indexes, no joins, no aggregates on exercise data. Every new feature that touches exercises requires loading and parsing everything in Python. Moving to relational tables is the foundation for any serious growth.