# Smoke Testing & Post-Deployment Verification

## Description

The final sanity check to ensure the migration to Google Cloud Run didn't break core logic or layout.

## Key Actions

1. Verify API endpoints return data on the hosted URL.
2. Test the UI on at least one mobile device and one desktop browser.
3. Check server logs for any "silent" errors during the initial boot-up.

## Acceptance Criteria

Core "Happy Path" (Login, Page Load, Data Fetch) works on the live site across devices.

---

## 1. Verify API Endpoints

### Public Endpoints (No Auth Required)

| Endpoint                                                                                   | Method | Expected Result                |
| ------------------------------------------------------------------------------------------ | ------ | ------------------------------ |
| `https://health-fitness-app-1083043809979.us-central1.run.app//exercises`                  | GET    | JSON list of exercises         |
| `https://health-fitness-app-1083043809979.us-central1.run.app//exercises?bodyPart=chest`   | GET    | Filtered exercise list         |
| `https://health-fitness-app-1083043809979.us-central1.run.app//templates`                  | GET    | JSON list of workout templates |
| `https://health-fitness-app-1083043809979.us-central1.run.app//templates/1`                | GET    | Single template with exercises |
| `https://health-fitness-app-1083043809979.us-central1.run.app//nutrition/search?q=chicken` | GET    | Paginated food search results  |
| `https://health-fitness-app-1083043809979.us-central1.run.app//nutrition/food/33691`       | GET    | Detailed nutrition info        |
| `https://health-fitness-app-1083043809979.us-central1.run.app//docs`                       | GET    | Swagger UI loads in browser    |

```bash
# Quick verification from terminal
https://health-fitness-app-1083043809979.us-central1.run.app/="https://health-fitness-app-XXXXX-uc.a.run.app"

curl -s "$https://health-fitness-app-1083043809979.us-central1.run.app//exercises" | head -c 200
curl -s "$https://health-fitness-app-1083043809979.us-central1.run.app//templates" | head -c 200
curl -s "$https://health-fitness-app-1083043809979.us-central1.run.app//nutrition/search?q=rice" | head -c 200
curl -s "$https://health-fitness-app-1083043809979.us-central1.run.app//docs" | head -c 100
```

### Auth Endpoints

| Step        | Endpoint                                                                 | Method | Body / Notes                                          |
| ----------- | ------------------------------------------------------------------------ | ------ | ----------------------------------------------------- |
| Register    | `https://health-fitness-app-1083043809979.us-central1.run.app//register` | POST   | `{"email":"test@test.com","password":"Test1234"}`     |
| Login       | `https://health-fitness-app-1083043809979.us-central1.run.app//login`    | POST   | Form data: `username=test@test.com&password=Test1234` |
| Get Profile | `https://health-fitness-app-1083043809979.us-central1.run.app//me`       | GET    | Header: `Authorization: Bearer <token>`               |

```bash
# Register a test user
curl -s -X POST "$https://health-fitness-app-1083043809979.us-central1.run.app//register" \
  -H "Content-Type: application/json" \
  -d '{"email":"smoketest@test.com","password":"Test1234"}'

# Login and capture token
TOKEN=$(curl -s -X POST "$https://health-fitness-app-1083043809979.us-central1.run.app//login" \
  -d "username=smoketest@test.com&password=Test1234" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo "Token: $TOKEN"

# Verify authenticated endpoint
curl -s "$https://health-fitness-app-1083043809979.us-central1.run.app//me" -H "Authorization: Bearer $TOKEN"
```

### Authenticated Data Endpoints

| Endpoint                                                                                                   | Method | What It Tests             |
| ---------------------------------------------------------------------------------------------------------- | ------ | ------------------------- |
| `https://health-fitness-app-1083043809979.us-central1.run.app//workouts`                                   | GET    | Workout history retrieval |
| `https://health-fitness-app-1083043809979.us-central1.run.app//user-workouts`                              | GET    | Custom workout listing    |
| `https://health-fitness-app-1083043809979.us-central1.run.app//nutrition/logs?log_date=2026-03-29`         | GET    | Meal log retrieval        |
| `https://health-fitness-app-1083043809979.us-central1.run.app//progress/weights?exercise_name=bench+press` | GET    | Performance trend data    |

```bash
# Run with the token from above
for ENDPOINT in workouts user-workouts "nutrition/logs?log_date=2026-03-29"; do
  echo "--- $ENDPOINT ---"
  curl -s "$https://health-fitness-app-1083043809979.us-central1.run.app//$ENDPOINT" -H "Authorization: Bearer $TOKEN" | head -c 200
  echo
done
```

### Expected HTTP Status Codes

| Status    | Meaning                                                        |
| --------- | -------------------------------------------------------------- |
| `200`     | Endpoint works, data returned                                  |
| `201`     | Resource created (register, create workout)                    |
| `401`     | Auth token missing or invalid (expected when not logged in)    |
| `404`     | Resource not found (expected for empty workout history)        |
| `502/503` | External API (RapidAPI/FatSecret) unreachable — check API keys |

---

## 2. Cross-Device UI Testing

### Desktop Browser (Chrome, Firefox, or Safari)

| Check              | How to Verify                                                                                    | Pass? |
| ------------------ | ------------------------------------------------------------------------------------------------ | ----- |
| Front page loads   | Navigate to `https://health-fitness-app-1083043809979.us-central1.run.app//` — React app renders |       |
| Login page         | Click Login — form appears, no console errors                                                    |       |
| Sign up flow       | Register new account — redirects to app                                                          |       |
| Exercise library   | Browse exercises — images and data load                                                          |       |
| Workout templates  | View template list — exercises populate                                                          |       |
| Nutrition search   | Search for a food — results appear                                                               |       |
| Workout history    | Log a workout — appears in history                                                               |       |
| No layout breakage | All pages have correct styling, no overflow                                                      |       |

### Mobile Device (Phone Browser)

| Check                | How to Verify                                                                          | Pass? |
| -------------------- | -------------------------------------------------------------------------------------- | ----- |
| Page loads on mobile | Open `https://health-fitness-app-1083043809979.us-central1.run.app//` on phone browser |       |
| Responsive layout    | No horizontal scrolling, text is readable                                              |       |
| Login works          | Can log in and access authenticated pages                                              |       |
| Touch interactions   | Buttons and links respond to taps                                                      |       |
| Data loads           | Exercise list, nutrition search return results                                         |       |

> **Tip:** Use Chrome DevTools Device Mode (F12 → Toggle Device Toolbar) to simulate mobile if a physical device is unavailable.

---

## 3. Check Server Logs

### View Cloud Run Logs

```bash
# Stream recent logs
gcloud run services logs read health-fitness-app \
  --region us-central1 \
  --limit 50

# Or use the Cloud Console
# https://console.cloud.google.com/run → health-fitness-app → Logs
```

### What to Look For

| Log Pattern                                                                         | Severity | Action                                                                                         |
| ----------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `Application startup complete`                                                      | Normal   | Uvicorn started successfully                                                                   |
| `create_db_and_tables` completing without errors                                    | Normal   | Datahttps://health-fitness-app-1083043809979.us-central1.run.app/ initialized                  |
| `ModuleNotFoundError`                                                               | Error    | Missing dependency in `requirements.txt`                                                       |
| `KeyError: 'DATAhttps://health-fitness-app-1083043809979.us-central1.run.app/_URL'` | Error    | Secret not mounted — check `--set-secrets`                                                     |
| `ConnectionRefusedError`                                                            | Error    | Datahttps://health-fitness-app-1083043809979.us-central1.run.app/ URL incorrect or unreachable |
| `401 Unauthorized` from external APIs                                               | Warning  | Check `XRAPID_API_KEY` or FatSecret secrets                                                    |
| Repeated `503` on nutrition/exercise endpoints                                      | Warning  | External API rate limit or key issue                                                           |
| No errors, only `200`/`201` responses                                               | Normal   | Everything is working                                                                          |

---

## Happy Path Checklist

The core user journey that must work on the live site:

| #   | Step            | Endpoint(s) Hit                          | Expected                          |
| --- | --------------- | ---------------------------------------- | --------------------------------- |
| 1   | Open the app    | `GET /`                                  | React SPA loads with landing page |
| 2   | Sign up         | `POST /register`                         | Account created, 201 response     |
| 3   | Log in          | `POST /login`                            | JWT token returned                |
| 4   | View exercises  | `GET /exercises`                         | Exercise library populates        |
| 5   | View templates  | `GET /templates`                         | Workout templates listed          |
| 6   | Start a workout | `POST /workouts/sessions`                | Session created                   |
| 7   | Log exercises   | `POST /workouts/sessions/{id}/exercises` | Exercises recorded                |
| 8   | Check history   | `GET /workouts`                          | Past workouts displayed           |
| 9   | Search food     | `GET /nutrition/search?q=...`            | Food results returned             |
| 10  | Log a meal      | `POST /nutrition/logs`                   | Meal entry saved                  |
| 11  | View profile    | `GET /me`                                | User info displayed               |

**All 11 steps passing = deployment verified. We still have some errors which is going to be our tasks for next sprint**
