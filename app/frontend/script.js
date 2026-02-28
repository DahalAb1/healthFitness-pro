// KEEP THE BACKEND RUNNING:
//   1. pip install -r requirements.txt
//   2. Run: uvicorn backend.main:app --reload
//   3. Backend will be live at http://127.0.0.1:8000
//   4. To inspect responses visually: http://127.0.0.1:8000/docs
//
// -- EXERCISE FUNCTIONS ---------------------------------------------------
//
// loadExercises(bodyPart?)
//   - loadExercises()           -> fetches all exercises
//   - loadExercises("CHEST")    -> fetches only chest exercises
//   - Body parts: "BACK", "LEGS", "SHOULDERS", "BICEPS", "TRICEPS", "ABS"
//   - Data is stored in the global `exercises` array and also returned
//
// loadExerciseById(id)
//   - Returns a single exercise object by its ID
//
// EXERCISE OBJECT SHAPE:
//   { id, name, muscle_group, equipment, description, image_url }
//
// -- TEMPLATE FUNCTIONS ---------------------------------------------------
//
// loadTemplates()
//   - Returns all workout templates
//   - Each template: { id, name, description, exercises[] }
//   - Each exercise entry: { exercise_id, target_sets, target_reps }
//
// loadTemplateById(id)
//   - Returns a single template by its ID
//   - Same shape as above
//

const BASE_URL = "http://127.0.0.1:8000";

// -- Exercises ------------------------------------------------------------

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

async function loadExerciseById(exerciseId) {
  try {
    const response = await fetch(`${BASE_URL}/exercises/${exerciseId}`);
    const exercise = await response.json();

    return {
      id: exercise.id,
      name: exercise.name,
      muscle_group: exercise.target,
      equipment: exercise.equipment,
      description: exercise.instructions,
      image_url: exercise.gifUrl
    };
  } catch (error) {
    console.error("Failed to load exercise:", error);
  }
}

// -- Templates ------------------------------------------------------------

async function loadTemplates() {
  try {
    const response = await fetch(`${BASE_URL}/templates`);
    return await response.json();
  } catch (error) {
    console.error("Failed to load templates:", error);
  }
}

async function loadTemplateById(templateId) {
  try {
    const response = await fetch(`${BASE_URL}/templates/${templateId}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to load template:", error);
  }
}

// Export for testability (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadExercises, loadExerciseById, loadTemplates, loadTemplateById, exercises };
}
