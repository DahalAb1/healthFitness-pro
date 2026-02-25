// KEEP THE BACKEND RUNNING:
//   1. pip install -r requirements.txt
//   2. Run: uvicorn backend.main:app --reload
//   3. Backend will be live at http://127.0.0.1:8000
//   4. To inspect responses visually: http://127.0.0.1:8000/docs
//
// HOW TO USE loadExercises():
//   - loadExercises()           → fetches all exercises
//   - loadExercises("CHEST")    → fetches only chest exercises
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

// Export for testability (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadExercises, exercises };
}
