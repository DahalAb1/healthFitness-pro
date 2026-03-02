// ============================================================
// STATE
// ============================================================

const state = {
    source: null,       // "template" | "custom"
    sourceId: null,
    name: "",
    description: "",
    exercises: [],      // normalized exercise objects
    currentIndex: 0,
    startedAt: null,
    completedAt: null,
};

// ============================================================
// DOM REFERENCES
// ============================================================

const dom = {
    workoutName: document.getElementById("workout-name"),
    workoutDescription: document.getElementById("workout-description"),
    workoutProgress: document.getElementById("workout-progress"),
    cardPast: document.getElementById("card-past"),
    cardCurrent: document.getElementById("card-current"),
    cardFuture: document.getElementById("card-future"),
    btnBack: document.getElementById("btn-back"),
    btnNext: document.getElementById("btn-next"),
    btnEnd: document.getElementById("btn-end"),
    extensions: document.getElementById("workout-extensions"),
};

// ============================================================
// INITIALIZATION
// ============================================================

async function initWorkout() {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("source");
    const id = params.get("id");

    if (!source || !id) {
        dom.workoutName.textContent = "No workout selected";
        return;
    }

    state.source = source;
    state.sourceId = Number(id);
    state.startedAt = new Date().toISOString();

    if (source === "template") {
        await loadFromTemplate(Number(id));
    } else if (source === "custom") {
        loadFromCustom(Number(id));
    } else {
        dom.workoutName.textContent = "Unknown workout source";
        return;
    }

    if (state.exercises.length === 0) {
        dom.workoutName.textContent = "No exercises found";
        return;
    }

    renderHeader();
    renderCards();
    updateButtons();
}

async function loadFromTemplate(templateId) {
    const payload = await loadTemplateExercises(templateId);
    if (!payload || !payload.exercises) return;

    state.name = payload.template_name;
    state.description = payload.template_description || "";
    state.exercises = payload.exercises.map(normalizeTemplateExercise);
}

function loadFromCustom(workoutId) {
    const raw = sessionStorage.getItem("activeWorkoutData");
    if (!raw) return;

    const data = JSON.parse(raw);
    if (data.id !== workoutId) return;

    state.name = data.name || "Custom Workout";
    state.description = data.creator_notes || "";
    state.exercises = (data.exercises || []).map(normalizeCustomExercise);

    sessionStorage.removeItem("activeWorkoutData");
}

// --- Normalizers: convert source-specific shapes to unified format ---

function normalizeTemplateExercise(ex) {
    const d = ex.details || {};
    return {
        exerciseId: ex.exercise_id,
        name: d.name || ex.exercise_id,
        sets: ex.target_sets,
        reps: ex.target_reps,
        muscleGroup: d.muscle_group || "",
        equipment: d.equipment || "",
        imageUrl: d.image_url || "",
        rest: null,
        loggedSets: [],
    };
}

function normalizeCustomExercise(ex) {
    return {
        exerciseId: ex.exercise_id || ex.exercise_name,
        name: ex.exercise_name || "Exercise",
        sets: ex.sets,
        reps: ex.reps,
        muscleGroup: "",
        equipment: "",
        imageUrl: "",
        rest: ex.rest || null,
        loggedSets: [],
    };
}

// ============================================================
// RENDERING
// ============================================================

function renderHeader() {
    dom.workoutName.textContent = state.name;
    dom.workoutDescription.textContent = state.description;
    renderProgress();
}

function renderProgress() {
    const total = state.exercises.length;
    const current = state.currentIndex + 1;
    dom.workoutProgress.textContent = `Exercise ${current} of ${total}`;
}

function renderCards() {
    const idx = state.currentIndex;
    const exercises = state.exercises;

    renderSingleCard(dom.cardPast, exercises[idx - 1]);
    renderSingleCard(dom.cardCurrent, exercises[idx]);
    renderSingleCard(dom.cardFuture, exercises[idx + 1]);
}

function renderSingleCard(cardEl, exercise) {
    if (!exercise) {
        cardEl.innerHTML = "";
        cardEl.classList.add("card-empty");
        return;
    }

    cardEl.classList.remove("card-empty");
    cardEl.innerHTML = `
        ${exercise.imageUrl
            ? `<img src="${exercise.imageUrl}" alt="${exercise.name}" class="card-exercise-image" />`
            : `<div class="card-image-placeholder"></div>`}
        <div class="card-body">
            <h3 class="card-exercise-name">${exercise.name}</h3>
            <p class="card-sets-reps">${exercise.sets} sets x ${exercise.reps} reps</p>
            <div class="card-badges">
                ${exercise.muscleGroup
                    ? `<span class="badge badge-muscle">${exercise.muscleGroup}</span>`
                    : ""}
                ${exercise.equipment
                    ? `<span class="badge badge-equipment">${exercise.equipment}</span>`
                    : ""}
            </div>
            ${exercise.rest
                ? `<p class="card-rest">Rest: ${exercise.rest}</p>`
                : ""}
        </div>
    `;
}

function updateButtons() {
    const idx = state.currentIndex;
    const total = state.exercises.length;

    dom.btnBack.disabled = idx === 0;

    if (idx === total - 1) {
        dom.btnNext.textContent = "Finish";
        dom.btnNext.classList.add("btn-finish");
    } else {
        dom.btnNext.textContent = "Next";
        dom.btnNext.classList.remove("btn-finish");
    }
}

// ============================================================
// NAVIGATION & EVENTS
// ============================================================

function goNext() {
    if (state.currentIndex < state.exercises.length - 1) {
        state.currentIndex++;
        renderCards();
        renderProgress();
        updateButtons();
    } else {
        finishWorkout();
    }
}

function goBack() {
    if (state.currentIndex > 0) {
        state.currentIndex--;
        renderCards();
        renderProgress();
        updateButtons();
    }
}

function endWorkout() {
    const confirmed = confirm("End this workout early? Your progress will be saved.");
    if (!confirmed) return;
    finishWorkout();
}

function finishWorkout() {
    state.completedAt = new Date().toISOString();

    const summary = {
        source: state.source,
        sourceId: state.sourceId,
        name: state.name,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
        exercisesCompleted: state.currentIndex + 1,
        exercisesTotal: state.exercises.length,
        exercises: state.exercises.map(function (ex) {
            return {
                exerciseId: ex.exerciseId,
                name: ex.name,
                targetSets: ex.sets,
                targetReps: ex.reps,
                loggedSets: ex.loggedSets,
            };
        }),
    };

    // Store summary for future use (workout history page)
    sessionStorage.setItem("lastCompletedWorkout", JSON.stringify(summary));

    alert("Workout complete! Great job.");
    window.location.href = "../workout_templates/templates.html";
}

// Wire up event listeners
dom.btnNext.addEventListener("click", goNext);
dom.btnBack.addEventListener("click", goBack);
dom.btnEnd.addEventListener("click", endWorkout);

// Initialize on page load
document.addEventListener("DOMContentLoaded", initWorkout);
