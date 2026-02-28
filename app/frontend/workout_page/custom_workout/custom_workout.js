// fallback library data if API fails
const fallbackLibrary = [
    {id: 1, name: 'Bench Press', equipment: 'Barbell', muscle_group: 'Chest'},
    {id: 2, name: 'Squat', equipment: 'Barbell', muscle_group: 'Legs'},
    {id: 3, name: 'Pull Up', equipment: 'Bodyweight', muscle_group: 'Back'},
    {id: 4, name: 'Overhead Press', equipment: 'Barbell', muscle_group: 'Shoulders'},
    {id: 5, name: 'Bicep Curl', equipment: 'Dumbbell', muscle_group: 'Arms'}
];

const masterLibrary = [];

// state
let sequence = [];
// keep track of IDs from the library that have been chosen
let selectedIds = [];

// elements
const libraryModal = document.getElementById('libraryModal');
const libraryList = document.getElementById('libraryList');
const searchInput = document.getElementById('searchInput');
const exerciseTableBody = document.querySelector('#exerciseTable tbody');

// fetch real exercises from backend
async function loadExercisesFromBackend() {
    try {
        const resp = await fetch('http://localhost:8000/exercises');
        if (!resp.ok) throw new Error('Failed to fetch exercises');
        const json = await resp.json();
        console.log('exercises from API:', json);
        
        // API returns {success, data: [...], meta: {...}}
        const exercises = json.data || [];
        
        // Transform field names to match frontend expectations
        const transformed = exercises.map(ex => {
            // equipments/bodyParts may be arrays of strings or objects depending on API
            const rawEquip = ex.equipments && ex.equipments[0];
            const equipment = typeof rawEquip === 'string'
                ? rawEquip
                : (rawEquip && rawEquip.name) || '';

            const rawBody = ex.bodyParts && ex.bodyParts[0];
            const muscle_group = typeof rawBody === 'string'
                ? rawBody
                : (rawBody && rawBody.name) || '';

            return {
                id: ex.exerciseId,
                name: ex.name,
                equipment,
                muscle_group
            };
        });
        
        console.log('transformed exercises:', transformed);
        return transformed;
    } catch (err) {
        console.error('loadExercisesFromBackend error:', err);
        console.log('falling back to demo exercises');
        return fallbackLibrary;  // fallback to demo if API fails
    }
}

async function initPage() {
    const realExercises = await loadExercisesFromBackend();
    masterLibrary.length = 0;
    masterLibrary.push(...realExercises);
    console.log('masterLibrary loaded:', masterLibrary);
}

// load exercises on page load
initPage();

// load saved workouts and render
async function loadSavedWorkouts() {
    try {
        const resp = await fetch('http://localhost:8000/user-workouts?user_id=1');
        if (!resp.ok) throw new Error('failed to load saved workouts');
        const data = await resp.json();
        const container = document.getElementById('savedWorkoutsContainer');
        container.innerHTML = '';
        if (!data || data.length === 0) {
            container.innerHTML = '<p>No saved workouts yet.</p>';
            return;
        }
        // render each saved workout
        data.slice().reverse().forEach(w => {
            const div = document.createElement('div');
            div.className = 'saved-workout';
            const title = document.createElement('strong');
            title.textContent = w.name || `Workout ${w.id}`;
            div.appendChild(title);
            const meta = document.createElement('div');
            meta.style.fontSize = '0.9em';
            meta.style.color = '#555';
            meta.textContent = `Exercises: ${w.exercises ? w.exercises.length : (w.exercise_ids ? w.exercise_ids.length : 0)}`;
            div.appendChild(meta);
            // optional expand list of exercise names
            if (w.exercises && w.exercises.length) {
                const ul = document.createElement('ul');
                w.exercises.forEach(ex => {
                    const li = document.createElement('li');
                    li.textContent = `${ex.exercise_name || ex.exercise_name} (${ex.sets}x${ex.reps})`;
                    ul.appendChild(li);
                });
                div.appendChild(ul);
            }
            container.appendChild(div);
        });
    } catch (err) {
        console.error('loadSavedWorkouts error', err);
    }
}

// load saved workouts after page init
loadSavedWorkouts();

function openLibrary() {
    populateLibrary(masterLibrary);
    libraryModal.classList.remove('hidden');
    searchInput.value = '';
}

function closeLibrary() {
    libraryModal.classList.add('hidden');
}

function populateLibrary(list) {
    libraryList.innerHTML = '';
    list.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} (${item.equipment})`;
        li.dataset.id = item.id;
        li.addEventListener('click', () => selectExercise(item));
        libraryList.appendChild(li);
    });
}

function selectExercise(exercise) {
    addExerciseToSequence(exercise);
    closeLibrary();
}

function addExerciseToSequence(exercise) {
    const entry = {
        id: exercise.id,
        name: exercise.name,
        target_sets: 3,
        target_reps: 10,
        rest_period: '60s'
    };
    sequence.push(entry);
    if (exercise.id != null && !selectedIds.includes(exercise.id)) {
        selectedIds.push(exercise.id);
    }
    renderSequence();
}

function renderSequence() {
    exerciseTableBody.innerHTML = '';
    sequence.forEach((entry, idx) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${entry.name}</td>
            <td><input type="number" value="${entry.target_sets}" min="1" data-index="${idx}" data-field="target_sets" /></td>
            <td><input type="number" value="${entry.target_reps}" min="1" data-index="${idx}" data-field="target_reps" /></td>
            <td><input type="text" value="${entry.rest_period}" data-index="${idx}" data-field="rest_period" /></td>
            <td><button type="button" class="removeBtn" data-index="${idx}">Remove</button></td>
        `;
        exerciseTableBody.appendChild(tr);
    });
    attachTableListeners();
}

function attachTableListeners() {
    document.querySelectorAll('#exerciseTable input').forEach(input => {
        input.addEventListener('change', e => {
            const idx = e.target.dataset.index;
            const field = e.target.dataset.field;
            sequence[idx][field] = e.target.value;
        });
    });

    document.querySelectorAll('.removeBtn').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = e.target.dataset.index;
            const removed = sequence.splice(idx, 1)[0];
            // also drop the id from selectedIds if it exists
            if (removed && removed.id != null) {
                selectedIds = selectedIds.filter(i => i !== removed.id);
            }
            renderSequence();
        });
    });
}

// manual add modal simpler prompt
function addManualEntry() {
    const name = prompt('Exercise name:');
    if (!name) return;
    const sets = prompt('Sets (default 3):', '3');
    const reps = prompt('Reps (default 10):', '10');
    const rest = prompt('Rest (default 60s):', '60s');
    sequence.push({id: Date.now(), name, target_sets: sets, target_reps: reps, rest_period: rest});
    renderSequence();
}

// search
searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    const filtered = masterLibrary.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.equipment.toLowerCase().includes(q) ||
        item.muscle_group.toLowerCase().includes(q)
    );
    populateLibrary(filtered);
});

// hook up buttons
document.getElementById('addLibraryBtn').addEventListener('click', openLibrary);
document.getElementById('modalClose').addEventListener('click', closeLibrary);
window.addEventListener('click', e => {
    if (e.target === libraryModal) closeLibrary();
});
document.getElementById('addManualBtn').addEventListener('click', addManualEntry);

// send workout object to backend using Fetch API
async function saveWorkout(data) {
    try {
        const resp = await fetch('http://localhost:8000/user-workouts', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
        });
        if (!resp.ok) throw new Error('status ' + resp.status);
        return await resp.json();
    } catch (err) {
        console.error('saveWorkout error', err);
        throw err;
    }
}

document.getElementById('workoutForm').addEventListener('submit', async e => {
    e.preventDefault();
    // build the payload, including selectedIds to mimic React state
    const workout = {
        user_id: 1, // TODO: replace with real user
        name: document.getElementById('templateName').value,
        creator_notes: document.getElementById('creatorNotes').value,
        exercise_ids: selectedIds.slice(),
        exercises: sequence.map(entry => ({
            exercise_id: entry.id ? String(entry.id) : undefined,
            exercise_name: entry.name,
            sets: Number(entry.target_sets),
            reps: Number(entry.target_reps),
            rest: entry.rest_period
        }))
    };
    console.log('selected exercise ids:', selectedIds);
    console.log('workout to save:', workout);
    try {
        const result = await saveWorkout(workout);
        console.log('server response', result);
        alert('Workout saved successfully');
        // refresh saved workouts list
        loadSavedWorkouts();
    } catch {
        alert('Failed to save workout; see console');
    }
});

// initial render
renderSequence();