const API_BASE = "http://127.0.0.1:8000";

function dateKeyNowInTZ(tz = "America/Chicago") {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`; // YYYY-MM-DD
}

/**
 * Logs a completed workout session to the backend so it shows up in calendar history.
 *
 * @param {object} args
 * @param {number} args.user_id
 * @param {string} [args.workout_date] - "YYYY-MM-DD" (defaults to today in America/Chicago)
 * @param {number} args.duration_minutes
 * @param {Array<{exercise_name:string, sets:number, reps:number, weight?:number}>} args.exercises
 */
async function logCompletedWorkout(args) {
  const payload = {
    user_id: args.user_id,
    workout_date: args.workout_date ?? dateKeyNowInTZ("America/Chicago"),
    duration_minutes: args.duration_minutes ?? 0,
    exercises: Array.isArray(args.exercises) ? args.exercises : [],
  };

  const res = await fetch(`${API_BASE}/workouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to log workout (${res.status}): ${txt}`);
  }

  return await res.json(); // returns the created session (with id)
}