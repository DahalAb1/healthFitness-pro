// import.meta.env is Vite's way of reading environment variables from the .env file.
// The file now reads the backend URL from the .env file instead of having it hardcoded.
const BASE_URL = import.meta.env.VITE_API_URL

export async function getExercises(bodyPart) {
  const url = bodyPart && bodyPart !== "ALL"
    ? `${BASE_URL}/exercises?bodyPart=${bodyPart.toLowerCase()}`
    : `${BASE_URL}/exercises`
  const res = await fetch(url)
  return res.json()
}

export async function getTemplates() {
  const res = await fetch(`${BASE_URL}/templates`)
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
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function getProgress(userId, exerciseName) {
  const res = await fetch(`${BASE_URL}/progress/weights?user_id=${userId}&exercise_name=${exerciseName}`)
  return res.json()
}
