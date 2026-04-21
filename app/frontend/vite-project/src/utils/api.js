// import.meta.env is Vite's way of reading environment variables from the .env file.
// The file now reads the backend URL from the .env file instead of having it hardcoded.
const BASE_URL = import.meta.env.VITE_API_URL || "";

import {
  BODY_PART_MAP,
  normalizeExercise,
  unwrapExerciseList,
} from "./exerciseUtils";

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
  return unwrapExerciseList(data).map(normalizeExercise);
}

export async function getTemplates() {
  const res = await fetch(`${BASE_URL}/templates`);
  return res.json();
}

export async function getTemplateExercises(templateId) {
  const res = await fetch(`${BASE_URL}/templates/${templateId}/exercises`);
  return res.json();
}

export async function getWorkoutByDate(token, date) {
  const res = await fetch(`${BASE_URL}/workouts/details?workout_date=${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getUserWorkouts(token) {
  const res = await fetch(`${BASE_URL}/user-workouts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function postUserWorkout(data, token) {
  const res = await fetch(`${BASE_URL}/user-workouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteUserWorkout(workoutId, token) {
  const res = await fetch(`${BASE_URL}/user-workouts/${workoutId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function searchFoods(query, page = 0, maxResults = 20) {
  const res = await fetch(
    `${BASE_URL}/nutrition/search?q=${encodeURIComponent(query)}&page=${page}&max_results=${maxResults}`,
  );
  return res.json();
}

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

export async function getWorkouts(token) {
  const res = await fetch(`${BASE_URL}/workouts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getProgressWeights(token, exerciseName) {
  const res = await fetch(
    `${BASE_URL}/progress/weights?exercise_name=${encodeURIComponent(exerciseName)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error("No data found");
  return res.json();
}

// ---------------------------------------------------------------------------
// Nutrition meal log
// ---------------------------------------------------------------------------

export async function getMealLogs(token, date) {
  const res = await fetch(`${BASE_URL}/nutrition/logs?log_date=${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`getMealLogs failed: ${res.status}`);
  return res.json();
}

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

export async function deleteMealLog(token, logId) {
  const res = await fetch(`${BASE_URL}/nutrition/logs/${logId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`deleteMealLog failed: ${res.status}`);
}

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
