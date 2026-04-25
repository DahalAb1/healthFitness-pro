# Custom Workout Backend Unit Testing Plan

## Overview
This document outlines the unit testing plan for custom workout backend endpoints. The purpose of these tests is to verify that custom workout routes handle authenticated requests correctly, return structured data, enforce user ownership, and provide expected error responses.

## Test 1: Create custom workout saves user-owned template

**Feature:** User-created custom workout templates.

**Code being tested:** `POST /user-workouts`

**Fields used:**
- `name`
- `exercises[]`
- `exercise_id`
- `exercise_name`
- `sets`
- `reps`
- authenticated user id from token

**Return object:**
A `CustomWorkoutRead` object for the created workout.

**Expected result:**
When valid workout data is submitted, the endpoint should return status code 201 and persist the workout under the authenticated user.

---

## Test 2: Create custom workout persists nested exercise payload correctly

**Feature:** Custom workout exercise payload mapping.

**Code being tested:** `POST /user-workouts`

**Fields used:**
- `exercises[]`
- each exercise object fields (`exercise_id`, `exercise_name`, `sets`, `reps`)

**Return object:**
Created custom workout object including persisted exercise list.

**Expected result:**
The endpoint should store and return exercise entries with the same names and set/rep values sent in the request.

---

## Test 3: Get custom workouts returns only current user's workouts

**Feature:** User-scoped custom workout retrieval.

**Code being tested:** `GET /user-workouts`

**Fields used:**
- authenticated user id

**Return object:**
A list of `CustomWorkoutRead` objects.

**Expected result:**
The endpoint should return only workouts owned by the authenticated user and exclude data for other users.

---

## Test 4: Get custom workouts returns empty list when user has none

**Feature:** Empty-state custom workout retrieval.

**Code being tested:** `GET /user-workouts`

**Fields used:**
- authenticated user id

**Return object:**
An empty list.

**Expected result:**
If the user has no saved custom workouts, the endpoint should return status code 200 with an empty array.

---

## Test 5: Delete custom workout succeeds for owner

**Feature:** Owner-authorized custom workout deletion.

**Code being tested:** `DELETE /user-workouts/{workout_id}`

**Fields used:**
- `workout_id`
- authenticated user id

**Return object:**
Success response object containing:
- `deleted`
- `id`

**Expected result:**
When deleting a workout owned by the current user, endpoint should return success and the workout should no longer appear in subsequent list results.

---

## Test 6: Delete custom workout returns 404 when workout does not exist

**Feature:** Missing resource handling for custom workout deletion.

**Code being tested:** `DELETE /user-workouts/{workout_id}`

**Fields used:**
- `workout_id`
- authenticated user id

**Return object:**
Error response with HTTP 404 and detail message.

**Expected result:**
If the target workout id does not exist, endpoint should return status code 404 with `Workout not found`.

---

## Test 7: Delete custom workout returns 404 when workout belongs to another user

**Feature:** Ownership enforcement on custom workout deletion.

**Code being tested:** `DELETE /user-workouts/{workout_id}`

**Fields used:**
- `workout_id`
- authenticated user id

**Return object:**
Error response with HTTP 404 and detail message.

**Expected result:**
If a user attempts to delete another user's workout, endpoint should return status code 404 and must not delete the resource.

---

## Test 8: Create and list sequence verifies consistency

**Feature:** Round-trip consistency for custom workouts.

**Code being tested:**
- `POST /user-workouts`
- `GET /user-workouts`

**Fields used:**
- newly created custom workout payload fields
- authenticated user id

**Return object:**
List of custom workouts including the newly created record.

**Expected result:**
After creating a workout, a subsequent list call should include that workout with expected name and exercise values.

---

## Test 9: Unauthorized request to custom workout routes is rejected

**Feature:** Authentication guard for custom workout routes.

**Code being tested:**
- `POST /user-workouts`
- `GET /user-workouts`
- `DELETE /user-workouts/{workout_id}`

**Fields used:**
- auth token header

**Return object:**
Auth error response (depends on auth implementation, typically 401/403).

**Expected result:**
Requests without valid authentication should be denied and should not create, list, or delete custom workouts.

---

## Test 10: Create custom workout validates required fields

**Feature:** Request validation for custom workout creation.

**Code being tested:** `POST /user-workouts`

**Fields used:**
- required payload fields for `CustomWorkoutCreate`

**Return object:**
Validation error response (typically 422) for malformed or incomplete payloads.

**Expected result:**
When required fields are missing or wrong type, endpoint should reject the request with validation error and should not persist data.

---

## Suggested Test Stack
- `pytest`
- `fastapi.testclient.TestClient`
- dependency overrides for auth/session
- fixture-driven seeded test data

## Definition of Done
- Core custom workout endpoint tests are implemented.
- Success and failure paths are covered for each endpoint.
- Ownership and authentication behavior is validated.
- All backend unit tests pass in CI/local runs.
