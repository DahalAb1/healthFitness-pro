// import.meta.env is Vite's way of reading environment variables from the .env file.
// The file now reads the backend URL from the .env file instead of having it hardcoded.
const BASE_URL = import.meta.env.VITE_API_URL

import { BODY_PART_MAP, normalizeExercise, unwrapExerciseList } from './exerciseUtils';

export async function getExercises(bodyPart) {
  const apiBodyPart = bodyPart && bodyPart !== 'ALL'
    ? (BODY_PART_MAP[bodyPart] ?? bodyPart.toLowerCase())
    : null;
  const url = apiBodyPart
    ? `${BASE_URL}/exercises?bodyPart=${apiBodyPart}`
    : `${BASE_URL}/exercises`;
  const res = await fetch(url);
  const data = await res.json();
  return unwrapExerciseList(data).map(normalizeExercise);
}

export async function getTemplates() {
  const res = await fetch(`${BASE_URL}/templates`)
  return res.json()
}

export async function getTemplateExercises(templateId) {
  const res = await fetch(`${BASE_URL}/templates/${templateId}/exercises`)
  return res.json()
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
  })
  return res.json()
}

export async function postUserWorkout(data, token) {
  const res = await fetch(`${BASE_URL}/user-workouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteUserWorkout(workoutId, userId) {
  const res = await fetch(`${BASE_URL}/user-workouts/${workoutId}?user_id=${userId}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function searchFoods(query, page = 0, maxResults = 20) {
  const res = await fetch(
    `${BASE_URL}/nutrition/search?q=${encodeURIComponent(query)}&page=${page}&max_results=${maxResults}`
  );
  return res.json();
}

export async function logWorkout(data, token) {
  const res = await fetch(`${BASE_URL}/workouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getWorkouts(token) {
  const res = await fetch(`${BASE_URL}/workouts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getProgressWeights(userId, exerciseName) {
  const res = await fetch(
    `${BASE_URL}/progress/weights?user_id=${userId}&exercise_name=${encodeURIComponent(exerciseName)}`
  );
  if (!res.ok) throw new Error('No data found');
  return res.json();
}
