// Central module for all HTTP calls to the backend.
// BASE_URL is read from the .env file (VITE_API_URL) so the backend address
// doesn't need to be hardcoded — falls back to "" (same origin) if not set.
const BASE_URL = import.meta.env.VITE_API_URL || "";

import { BODY_PART_MAP, normalizeExercise } from "./exerciseUtils";

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

// Fetches exercises, optionally filtered by body part.
// bodyPart is a UI label (e.g. "BICEPS") — BODY_PART_MAP translates it to the
// value ExerciseDB expects (e.g. "biceps"). "ALL" or no filter fetches everything.
// The backend wraps the ExerciseDB array as { data: [...] }, so we unwrap it here.
// Throws on non-2xx so callers can surface the error (e.g. rate limit message).
export async function getExercises(bodyPart) {
  const apiBodyPart =
    bodyPart && bodyPart !== "ALL"
      ? (BODY_PART_MAP[bodyPart] ?? bodyPart.toLowerCase())
      : null;
  const url = apiBodyPart
    ? `${BASE_URL}/exercises?bodyPart=${apiBodyPart}`
    : `${BASE_URL}/exercises`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `getExercises failed: ${res.status}`);
  }
  const data = await res.json();
  const exercises = Array.isArray(data.data) ? data.data : [];
  return exercises.map(normalizeExercise);
}

// ---------------------------------------------------------------------------
// Workout templates
// ---------------------------------------------------------------------------

// Returns all saved workout templates.
export async function getTemplates() {
  const res = await fetch(`${BASE_URL}/templates`);
  return res.json();
}

// Returns the exercises belonging to a specific template.
export async function getTemplateExercises(templateId) {
  const res = await fetch(`${BASE_URL}/templates/${templateId}/exercises`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Workouts
// ---------------------------------------------------------------------------

// Returns the workout logged on a specific date for the authenticated user.
export async function getWorkoutByDate(token, date) {
  const res = await fetch(`${BASE_URL}/workouts/details?workout_date=${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Returns all workouts logged by the authenticated user.
export async function getUserWorkouts(token) {
  const res = await fetch(`${BASE_URL}/user-workouts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Saves a new user workout entry.
export async function postUserWorkout(data, token) {
  const res = await fetch(`${BASE_URL}/user-workouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) {
    const detail = body?.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => d?.msg).filter(Boolean).join(', ')
      : detail;
    throw new Error(message || `Failed to save workout (${res.status})`);
  }
  return body;
}

// Deletes a specific user workout by ID.
export async function deleteUserWorkout(workoutId, token) {
  const res = await fetch(`${BASE_URL}/user-workouts/${workoutId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`deleteUserWorkout failed: ${res.status}`);
  return res.json();
}

// Logs a completed workout session for the authenticated user.
export async function logWorkout(data, token) {
  const res = await fetch(`${BASE_URL}/workouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`logWorkout failed: ${res.status}`);
  return res.json();
}

// Returns all workout sessions for the authenticated user.
export async function getWorkouts(token) {
  const res = await fetch(`${BASE_URL}/workouts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Returns weight progress over time for a specific exercise.
export async function getProgressWeights(token, exerciseName) {
  const res = await fetch(
    `${BASE_URL}/progress/weights?exercise_name=${encodeURIComponent(exerciseName)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error("No data found");
  return res.json();
}

// ---------------------------------------------------------------------------
// Nutrition
// ---------------------------------------------------------------------------

// Searches the FatSecret food database. Supports pagination via page and maxResults.
export async function searchFoods(query, page = 0, maxResults = 20) {
  const res = await fetch(
    `${BASE_URL}/nutrition/search?q=${encodeURIComponent(query)}&page=${page}&max_results=${maxResults}`,
  );
  return res.json();
}

// Returns all meal log entries for the authenticated user on a given date.
export async function getMealLogs(token, date) {
  const res = await fetch(`${BASE_URL}/nutrition/logs?log_date=${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`getMealLogs failed: ${res.status}`);
  return res.json();
}

// Returns the days in a given month that have at least one meal logged.
// Used to highlight active days on the nutrition calendar.
export async function getNutritionActiveDates(token, year, month) {
  const res = await fetch(
    `${BASE_URL}/nutrition/logs/active-dates?year=${year}&month=${month}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) throw new Error(`getNutritionActiveDates failed: ${res.status}`);
  return res.json(); // { days: [1, 5, 14, ...] }
}

// Logs a new meal entry for the authenticated user.
export async function addMealLog(token, entry) {
  const res = await fetch(`${BASE_URL}/nutrition/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error(`addMealLog failed: ${res.status}`);
  return res.json();
}

// Deletes a specific meal log entry by ID.
export async function deleteMealLog(token, logId) {
  const res = await fetch(`${BASE_URL}/nutrition/logs/${logId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`deleteMealLog failed: ${res.status}`);
}

// Returns daily nutrition totals over a rolling window of days.
// If days is omitted the backend returns its default range.
export async function getNutritionTrends(token, days) {
  const url = days
    ? `${BASE_URL}/nutrition/logs/trends?days=${days}`
    : `${BASE_URL}/nutrition/logs/trends`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`getNutritionTrends failed: ${res.status}`);
  return res.json(); // [{ date, kcal, protein_g, carbs_g, fat_g }, ...]
}
