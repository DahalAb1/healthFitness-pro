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
    console.log("Raw API response:", JSON.stringify(data, null, 2));

    const list = Array.isArray(data)
      ? data
      : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.exercises)
          ? data.exercises
          : [];

    const transformed = list.map((exercise) => ({
      id: exercise.exerciseId || exercise.id,
      name: exercise.name,
      muscle_group:
        (exercise.targetMuscles && exercise.targetMuscles[0]) ||
        (exercise.bodyParts && exercise.bodyParts[0]) ||
        exercise.target || "",
      equipment:
        (exercise.equipments && exercise.equipments[0]) ||
        exercise.equipment || "",
      description: exercise.instructions || exercise.steps || exercise.guide || "",
      image_url: exercise.imageUrl || exercise.gifUrl || exercise.image_url || "",
    }));
    console.log("First exercise after transform:", transformed[0]);

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
      id: exercise.id || exerciseId,
      name: exercise.name || exercise.exercise_id || exerciseId,
      muscle_group: exercise.target || exercise.muscle_group || "",
      equipment: exercise.equipment || "",
      description: exercise.instructions || exercise.description || "",
      image_url: exercise.gifUrl || exercise.image_url || ""
    };
  } catch (error) {
    console.error("Failed to load exercise:", error);
  }
}

async function loadTemplateExercises(templateId) {
  try {
    const response = await fetch(`${BASE_URL}/templates/${templateId}/exercises`);
    return await response.json();
  } catch (error) {
    console.error("Failed to load template exercises:", error);
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
if (typeof module !== "undefined" && module.exports) {
  module.exports = { loadExercises, exercises };
}

function showLoadingSpinner() {
  var spinner = document.getElementById("loading-spinner");
  var grid = document.getElementById("exercise-grid");
  var empty = document.getElementById("empty-state");
  if (spinner) spinner.classList.remove("hidden");
  if (grid) grid.classList.add("hidden");
  if (empty) empty.classList.add("hidden");
}

function hideLoadingSpinner() {
  var spinner = document.getElementById("loading-spinner");
  if (spinner) spinner.classList.add("hidden");
}

function renderExerciseCards(exerciseList) {
  var grid = document.getElementById("exercise-grid");
  var empty = document.getElementById("empty-state");
  if (!grid) return;

  grid.innerHTML = "";
  if (empty) empty.classList.add("hidden");

  if (!exerciseList || exerciseList.length === 0) {
    grid.classList.add("hidden");
    if (empty) empty.classList.remove("hidden");
    return;
  }

  grid.classList.remove("hidden");

  exerciseList.forEach(function (exercise) {
    var card = document.createElement("div");
    card.className = "exercise-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", "View details for " + exercise.name);

    card.innerHTML =
      "<img" +
      ' class="exercise-card-image"' +
      ' src="' +
      exercise.image_url +
      '"' +
      ' alt="' +
      exercise.name +
      '"' +
      ' loading="lazy"' +
      " onerror=\"this.style.background='#e8e8e8'\"" +
      "/>" +
      '<div class="exercise-card-body">' +
      '<h3 class="exercise-card-name">' +
      exercise.name +
      "</h3>" +
      '<div class="exercise-card-badges">' +
      '<span class="badge badge-muscle">' +
      exercise.muscle_group +
      "</span>" +
      '<span class="badge badge-equipment">' +
      exercise.equipment +
      "</span>" +
      "</div>" +
      "</div>";

    card.addEventListener("click", function () {
      showExerciseDetail(exercise);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showExerciseDetail(exercise);
      }
    });

    grid.appendChild(card);
  });
}

function showExerciseDetail(exercise) {
  var modal = document.getElementById("exercise-modal");
  if (!modal) return;

  document.getElementById("modal-image").src = exercise.image_url;
  document.getElementById("modal-image").alt = exercise.name;
  document.getElementById("modal-name").textContent = exercise.name;
  document.getElementById("modal-muscle").textContent = exercise.muscle_group;
  document.getElementById("modal-equipment").textContent = exercise.equipment;

  var list = document.getElementById("modal-instructions");
  list.innerHTML = "";

  var steps = Array.isArray(exercise.description)
    ? exercise.description
    : exercise.description
      ? [exercise.description]
      : ["No instructions available for this exercise."];

  steps.forEach(function (step) {
    var li = document.createElement("li");
    li.textContent = step;
    list.appendChild(li);
  });

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeExerciseDetail() {
  var modal = document.getElementById("exercise-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

if (document.getElementById("exercise-grid")) {
  document
    .getElementById("modal-close-btn")
    .addEventListener("click", closeExerciseDetail);
  document
    .getElementById("modal-overlay")
    .addEventListener("click", closeExerciseDetail);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeExerciseDetail();
  });

  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      document.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      var filter = btn.dataset.filter;
      var BODY_PART_MAP = {
        "chest": "chest",
        "back": "back",
        "legs": "thighs",
        "shoulders": "shoulders",
        "biceps": "biceps",
        "triceps": "triceps",
        "abs": "waist"
      };
      var apiBodyPart = filter === "ALL" ? null : (BODY_PART_MAP[filter.toLowerCase()] || filter.toLowerCase());
      showLoadingSpinner();
      await loadExercises(apiBodyPart);
      hideLoadingSpinner();
      renderExerciseCards(exercises);
    });
  });

  (async function () {
    showLoadingSpinner();
    await loadExercises();
    hideLoadingSpinner();
    renderExerciseCards(exercises);
  })();
}
