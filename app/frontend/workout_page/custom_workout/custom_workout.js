// sample library data; in a real app this would come from backend
const masterLibrary = [
    {id: 1, name: 'Bench Press', equipment: 'Barbell', muscle_group: 'Chest'},
    {id: 2, name: 'Squat', equipment: 'Barbell', muscle_group: 'Legs'},
    {id: 3, name: 'Pull Up', equipment: 'Bodyweight', muscle_group: 'Back'},
    {id: 4, name: 'Overhead Press', equipment: 'Barbell', muscle_group: 'Shoulders'},
    {id: 5, name: 'Bicep Curl', equipment: 'Dumbbell', muscle_group: 'Arms'}
];

// state
let sequence = [];

// elements
const libraryModal = document.getElementById('libraryModal');
const libraryList = document.getElementById('libraryList');
const searchInput = document.getElementById('searchInput');
const exerciseTableBody = document.querySelector('#exerciseTable tbody');

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
            sequence.splice(idx, 1);
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

document.getElementById('workoutForm').addEventListener('submit', e => {
    e.preventDefault();
    const workout = {
        template_name: document.getElementById('templateName').value,
        creator_notes: document.getElementById('creatorNotes').value,
        exercise_sequence: sequence
    };
    console.log('Saving workout:', workout);
    alert('Workout saved (see console)');
});

// initial render
renderSequence();