// KEEP THE BACKEND RUNNING:
//   1. pip install -r requirements.txt
//   2. Run: uvicorn backend.main:app --reload
//   3. Backend will be live at http://127.0.0.1:8000
//   4. To inspect responses visually: http://127.0.0.1:8000/docs
//
// HOW TO USE loadExercises():
//   - loadExercises()           → fetches all exercises
//   - loadExercises("CHEST")    → fetches only chest exercises
//   - Other body part options: "BACK", "LEGS", "SHOULDERS",
//     "BICEPS", "TRICEPS", "ABS"
//   - Data is stored in the global `exercises` array and also returned from the function
//
// EACH EXERCISE OBJECT HAS THESE FIELDS:
//   {
//     id:           unique identifier
//     name:         exercise name       e.g. "Bench Press"
//     muscle_group: primary muscle      e.g. "Chest"
//     equipment:    equipment needed    e.g. "Barbell"
//     description:  step-by-step instructions
//     image_url:    URL to exercise gif/image
//   }
//

const BASE_URL = "http://127.0.0.1:8000";

let exercises = [];

async function loadExercises(bodyPart = null) {
  try {
    const url = bodyPart
      ? `${BASE_URL}/exercises?bodyPart=${bodyPart}`
      : `${BASE_URL}/exercises`;

    const response = await fetch(url);
    const data = await response.json();

    const transformed = data.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      muscle_group: exercise.target,
      equipment: exercise.equipment,
      description: exercise.instructions,
      image_url: exercise.gifUrl
    }));

    exercises.length = 0;
    exercises.push(...transformed);

    console.log("Exercises loaded:", exercises);
    return exercises;
  } catch (error) {
    console.error("Failed to load exercises:", error);
  }
}

let progressChartInstance = null;

async function loadProgress() {
  const userIdEl = document.getElementById("progressUserId");
  const exerciseEl = document.getElementById("progressExerciseName");
  const canvas = document.getElementById("progressChart");
  const statsEl = document.getElementById("progressStats");

  if (!userIdEl || !exerciseEl || !canvas || !statsEl) {
    console.error("Progress tracker elements not found on this page.");
    return;
  }

  const userId = userIdEl.value.trim();
  const exerciseName = exerciseEl.value.trim();

  if (!userId || !exerciseName) {
    alert("Please enter a user ID and exercise name.");
    return;
  }

  const url = `${BASE_URL}/progress/weights?user_id=${encodeURIComponent(userId)}&exercise_name=${encodeURIComponent(exerciseName)}`;

  try {
    statsEl.innerHTML = "Loading...";
    const response = await fetch(url);

    if (!response.ok) {
      let msg = `Request failed (${response.status})`;
      try {
        const err = await response.json();
        if (err?.detail) msg = err.detail;
      } catch {}
      throw new Error(msg);
    }

    const data = await response.json();

    const labels = data.points.map(p => p.date);
    const weights = data.points.map(p => p.weight);

    const ctx = canvas.getContext("2d");

    if (progressChartInstance) progressChartInstance.destroy();

    progressChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${data.exercise_name} Max Weight`,
            data: weights,
            borderWidth: 2,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });

    const pct =
      data.percent_change == null ? "—" : `${Number(data.percent_change).toFixed(1)}%`;

    statsEl.innerHTML = `
      <p><strong>First:</strong> ${data.first_weight ?? "—"}</p>
      <p><strong>Last:</strong> ${data.last_weight ?? "—"}</p>
      <p><strong>Change:</strong> ${data.change ?? "—"}</p>
      <p><strong>% Change:</strong> ${pct}</p>
    `;
  } catch (err) {
    statsEl.innerHTML = "";
    alert(err.message || "Error fetching progress");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("progressChart")) {
    loadProgress();
  }
});

// Export for testability (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadExercises, exercises };
}