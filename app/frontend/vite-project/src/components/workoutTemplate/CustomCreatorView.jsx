import { useState, useEffect } from 'react';
import { postUserWorkout, getUserWorkouts } from '../../utils/api';

function createEmptyRow() {
  return {
    id: crypto.randomUUID(),
    exercise: '',
    sets: 3,
    reps: 10,
    rest: '60s',
  };
}

function CustomCreatorView() {
  const [workoutName, setWorkoutName] = useState('');
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState([createEmptyRow()]);
  const [savedWorkouts, setSavedWorkouts] = useState([]);

  useEffect(() => {
    getUserWorkouts(1).then((data) => setSavedWorkouts(data));
  }, []);

  function addRow() {
    setRows((prev) => [...prev, createEmptyRow()]);
  }

  function removeRow(id) {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  }

  function updateRow(id, field, value) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }

  function saveWorkout() {
    const trimmedName = workoutName.trim();
    if (!trimmedName) {
      window.alert('Please enter a workout name before saving.');
      return;
    }

    postUserWorkout({
      user_id: 1,
      name: trimmedName,
      notes,
      exercises: rows.map((row) => ({ exercise_name: row.exercise, sets: row.sets, reps: row.reps })),
    }).then((saved) => {
      setSavedWorkouts((prev) => [...prev, saved]);
    });

    setWorkoutName('');
    setNotes('');
    setRows([createEmptyRow()]);
  }

  return (
    <section className="wt-view-content active">
      <div className="wt-card">
        <h2>Create New Routine</h2>

        <div className="wt-input-group">
          <label htmlFor="workoutName">WORKOUT NAME</label>
          <input
            id="workoutName"
            type="text"
            value={workoutName}
            placeholder="e.g. Hypertrophy Upper Body"
            onChange={(event) => setWorkoutName(event.target.value)}
          />
        </div>

        <div className="wt-input-group">
          <label htmlFor="workoutNotes">NOTES</label>
          <textarea
            id="workoutNotes"
            value={notes}
            placeholder="Add optional notes for this workout..."
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div className="wt-table-container">
          <table className="wt-workout-table" id="exerciseTable">
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Sets</th>
                <th>Reps</th>
                <th>Rest</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody id="exerciseBody">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="text"
                      value={row.exercise}
                      placeholder="Select Exercise..."
                      onChange={(event) => updateRow(row.id, 'exercise', event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.sets}
                      onChange={(event) => updateRow(row.id, 'sets', Number(event.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.reps}
                      onChange={(event) => updateRow(row.id, 'reps', Number(event.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.rest}
                      onChange={(event) => updateRow(row.id, 'rest', event.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="wt-remove-btn"
                      onClick={() => removeRow(row.id)}
                      aria-label="Remove exercise row"
                    >
                      x
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  



        <button type="button" className="btn wt-btn-full wt-btn-save" onClick={addRow}>
          + Add Exercise From Library
        </button>

        <button type="button" className="btn wt-btn-full wt-btn-save" onClick={saveWorkout}>
          Save Workout
        </button>
      </div>

      <section className="wt-saved-workouts">
        <h3>Your Saved Workouts</h3>

        <div id="savedWorkoutsContainer" className="wt-templates-grid">
          {savedWorkouts.length === 0 ? (
            <p className="wt-empty-state">No saved workouts yet. Create one above!</p>
          ) : (
            savedWorkouts.map((workout) => (
              <article key={workout.id} className="wt-template-card">
                <h2>{workout.name}</h2>
                <p>Custom routine saved from the creator.</p>
                <span>{workout.exerciseCount} EXERCISES</span>
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
}

export default CustomCreatorView;
