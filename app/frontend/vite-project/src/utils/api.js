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

export async function getWorkoutByDate(userId, date) {
  const res = await fetch(`${BASE_URL}/workouts/details?user_id=${userId}&workout_date=${date}`)
  return res.json()
}

export async function getUserWorkouts(userId) {
  const res = await fetch(`${BASE_URL}/user-workouts?user_id=${userId}`)
  return res.json()
}

export async function postUserWorkout(data) {
  const res = await fetch(`${BASE_URL}/user-workouts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteUserWorkout(workoutId, userId) {
  const res = await fetch(`${BASE_URL}/user-workouts/${workoutId}?user_id=${userId}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function logWorkout(data) {
  const res = await fetch(`${BASE_URL}/workouts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getWorkouts(userId) {
  const res = await fetch(`${BASE_URL}/workouts?user_id=${userId}`);
  return res.json();
}

export async function getProgressWeights(userId, exerciseName) {
  const res = await fetch(
    `${BASE_URL}/progress/weights?user_id=${userId}&exercise_name=${encodeURIComponent(exerciseName)}`
  );
  if (!res.ok) throw new Error('No data found');
  return res.json();
}
