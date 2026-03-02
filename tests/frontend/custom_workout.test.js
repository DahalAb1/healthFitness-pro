/**
 * Unit tests for custom_workout.js (Custom Workout Creator)
 * Tests core logic for adding, editing, and saving custom workouts
 */

// Mock DOM elements and global fetch
const mockAddEventListener = jest.fn();
global.fetch = jest.fn();

document.body.innerHTML = `
  <div id="libraryModal"></div>
  <ul id="libraryList"></ul>
  <input id="searchInput" />
  <table id="exerciseTable"><tbody></tbody></table>
  <form id="workoutForm"></form>
  <input id="templateName" />
  <input id="creatorNotes" />
  <div id="savedWorkoutsContainer"></div>
  <div id="beginWorkoutContainer"></div>
  <button id="addLibraryBtn"></button>
  <button id="modalClose"></button>
  <button id="addManualBtn"></button>
`;

// Import functions from the custom_workout.js file
let addExerciseToSequence, renderSequence, saveWorkout, sequence, selectedIds;

describe('Custom Workout Creator', () => {
  beforeAll(() => {
    // Import the script and extract functions/variables
    const mod = require('..\\..\\..\\app\\frontend\\workout_page\\custom_workout\\custom_workout.js');
    addExerciseToSequence = mod.addExerciseToSequence;
    renderSequence = mod.renderSequence;
    saveWorkout = mod.saveWorkout;
    sequence = mod.sequence;
    selectedIds = mod.selectedIds;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    sequence.length = 0;
    selectedIds.length = 0;
  });

  test('addExerciseToSequence adds an exercise to the sequence and selectedIds', () => {
    const exercise = { id: 101, name: 'Push Up' };
    addExerciseToSequence(exercise);
    expect(sequence).toHaveLength(1);
    expect(sequence[0].name).toBe('Push Up');
    expect(selectedIds).toContain(101);
  });

  test('addExerciseToSequence does not duplicate selectedIds', () => {
    const exercise = { id: 101, name: 'Push Up' };
    addExerciseToSequence(exercise);
    addExerciseToSequence(exercise);
    expect(selectedIds.filter(id => id === 101).length).toBe(1);
  });

  test('renderSequence updates the exercise table body', () => {
    const exercise = { id: 102, name: 'Squat' };
    addExerciseToSequence(exercise);
    renderSequence();
    const rows = document.querySelectorAll('#exerciseTable tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].innerHTML).toContain('Squat');
  });

  test('saveWorkout sends correct payload to backend', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    const data = {
      user_id: 1,
      name: 'Test Workout',
      creator_notes: 'Notes',
      exercise_ids: [1, 2],
      exercises: [
        { exercise_id: 1, exercise_name: 'Bench', sets: 3, reps: 10, rest: '60s' }
      ]
    };
    const result = await saveWorkout(data);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/user-workouts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      })
    );
    expect(result).toEqual({ success: true });
  });

  test('saveWorkout throws error on failed response', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(saveWorkout({})).rejects.toThrow('status 500');
  });
});
