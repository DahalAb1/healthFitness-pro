import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postUserWorkout, getUserWorkouts, deleteUserWorkout, getExercises } from '../../utils/api';

const BODY_PARTS = ['ALL', 'CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'LEGS', 'ABS', 'CARDIO'];

function createEmptyRow() {
  return {
    id: crypto.randomUUID(),
    exerciseId: null,
    exercise: '',
    sets: 3,
    reps: 10,
    rest: '60s',
  };
}

function CustomCreatorView() {
  const navigate = useNavigate();

  const [workoutName, setWorkoutName] = useState('');
  const [rows, setRows] = useState([createEmptyRow()]);
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());

  function toggleExpanded(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Library modal state
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState('ALL');
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryItems, setLibraryItems] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  useEffect(() => {
    getUserWorkouts(1).then((data) => setSavedWorkouts(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (!showLibrary) return;
    setLibraryLoading(true);
    setLibraryItems([]);
    getExercises(libraryFilter)
      .then((data) => setLibraryItems(Array.isArray(data) ? data : []))
      .finally(() => setLibraryLoading(false));
  }, [showLibrary, libraryFilter]);

  function addExerciseFromLibrary(exercise) {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        exerciseId: exercise.id || null,
        exercise: exercise.name || '',
        sets: 3,
        reps: 10,
        rest: '60s',
      },
    ]);
    setShowLibrary(false);
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
      exercises: rows.map((row) => ({
        exercise_id: row.exerciseId || null,
        exercise_name: row.exercise,
        sets: row.sets,
        reps: row.reps,
      })),
    }).then((saved) => {
      setSavedWorkouts((prev) => [...prev, saved]);
    });

    setWorkoutName('');
    setRows([createEmptyRow()]);
  }

  function handleDelete(workout) {
    if (!window.confirm(`Delete "${workout.name}"?`)) return;
    deleteUserWorkout(workout.id, 1).then(() => {
      setSavedWorkouts((prev) => prev.filter((w) => w.id !== workout.id));
    });
  }

  function handleCustomize(workout) {
    setWorkoutName(workout.name);
    setRows(
      (workout.exercises || []).map((ex) => ({
        id: crypto.randomUUID(),
        exerciseId: ex.exercise_id || null,
        exercise: ex.exercise_name || '',
        sets: ex.sets || 3,
        reps: ex.reps || 10,
        rest: '60s',
      })),
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBegin(workout) {
    sessionStorage.setItem('activeWorkoutSource', 'custom');
    sessionStorage.setItem('activeWorkoutId', String(workout.id));
    sessionStorage.setItem('activeWorkoutName', workout.name);
    sessionStorage.setItem('activeWorkoutExercises', JSON.stringify(workout.exercises || []));
    navigate(`/active-workout?source=custom&id=${workout.id}`);
  }

  const filteredLibrary = libraryItems.filter((ex) =>
    ex.name?.toLowerCase().includes(librarySearch.toLowerCase()),
  );

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
                      placeholder="Type or add from library..."
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
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          className="btn wt-btn-full wt-btn-add"
          onClick={() => setShowLibrary(true)}
        >
          + Add Exercise From Library
        </button>

        <button type="button" className="btn wt-btn-full wt-btn-save" onClick={saveWorkout}>
          Save Workout
        </button>
      </div>

      {/* Exercise Library Modal */}
      {showLibrary && (
        <div className="wt-library-overlay" onClick={() => setShowLibrary(false)}>
          <div className="wt-library-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wt-library-header">
              <h3>Add From Exercise Library</h3>
              <button
                type="button"
                className="wt-detail-close"
                onClick={() => setShowLibrary(false)}
                aria-label="Close library"
              >
                ✕
              </button>
            </div>

            <div className="wt-library-controls">
              <input
                type="text"
                className="wt-library-search"
                placeholder="Search exercises..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
              />
              <select
                className="wt-library-filter"
                value={libraryFilter}
                onChange={(e) => {
                  setLibraryFilter(e.target.value);
                  setLibrarySearch('');
                }}
              >
                {BODY_PARTS.map((bp) => (
                  <option key={bp} value={bp}>{bp}</option>
                ))}
              </select>
            </div>

            <div className="wt-library-list">
              {libraryLoading && <p className="wt-detail-loading">Loading exercises...</p>}
              {!libraryLoading && filteredLibrary.length === 0 && (
                <p className="wt-detail-loading">No exercises found.</p>
              )}
              {filteredLibrary.map((ex) => (
                <button
                  key={ex.id || ex.name}
                  type="button"
                  className="wt-library-item"
                  onClick={() => addExerciseFromLibrary(ex)}
                >
                  {ex.image_url && (
                    <img src={ex.image_url} alt={ex.name} className="wt-library-item-img" />
                  )}
                  <div className="wt-library-item-info">
                    <strong>{ex.name}</strong>
                    {(ex.muscle_group || ex.equipment) && (
                      <span>{[ex.muscle_group, ex.equipment].filter(Boolean).join(' · ')}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="wt-saved-workouts">
        <h3>Your Saved Workouts</h3>

        <div id="savedWorkoutsContainer" className="wt-templates-grid">
          {savedWorkouts.length === 0 ? (
            <p className="wt-empty-state">No saved workouts yet. Create one above!</p>
          ) : (
            savedWorkouts.map((workout) => {
              const isExpanded = expandedIds.has(workout.id);
              const exerciseCount = workout.exercises?.length ?? 0;
              return (
                <article key={workout.id} className="wt-template-card">
                  <h2>{workout.name}</h2>
                  <p>Custom routine</p>
                  <span>{exerciseCount} EXERCISES</span>

                  <div className="wt-card-actions">
                    <button
                      type="button"
                      className="btn wt-card-btn wt-btn-view"
                      onClick={() => toggleExpanded(workout.id)}
                    >
                      {isExpanded ? 'Hide' : 'View'}
                    </button>
                    <button
                      type="button"
                      className="btn wt-card-btn wt-btn-customize"
                      onClick={() => handleCustomize(workout)}
                    >
                      Customize
                    </button>
                    <button
                      type="button"
                      className="btn wt-card-btn wt-btn-begin"
                      onClick={() => handleBegin(workout)}
                    >
                      Begin
                    </button>
                    <button
                      type="button"
                      className="btn wt-card-btn wt-btn-delete"
                      onClick={() => handleDelete(workout)}
                    >
                      Delete
                    </button>
                  </div>

                  {isExpanded && (workout.exercises || []).length > 0 && (
                    <ul className="wt-card-exercise-list">
                      {workout.exercises.map((ex, i) => (
                        <li key={i} className="wt-card-exercise-item">
                          <span className="wt-card-exercise-name">{ex.exercise_name}</span>
                          <span className="wt-card-exercise-meta">{ex.sets}×{ex.reps}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
    </section>
  );
}

export default CustomCreatorView;
