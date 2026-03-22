const BASE_URL = "http://localhost:8000"

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
