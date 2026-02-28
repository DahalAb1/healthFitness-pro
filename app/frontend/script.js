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

    const transformed = data.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      muscle_group: exercise.target,
      equipment: exercise.equipment,
      description: exercise.instructions,
      image_url: exercise.gifUrl,
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
    : [exercise.description];

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
      showLoadingSpinner();
      await loadExercises(filter === "ALL" ? null : filter);
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
