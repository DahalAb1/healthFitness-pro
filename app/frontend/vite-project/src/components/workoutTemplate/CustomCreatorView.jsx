import { useMemo, useState } from 'react';
import { useCustomCreatorView } from '../../hooks/useCustomCreatorView';
import WorkoutBuilderForm from './WorkoutBuilderForm';
import ExerciseLibraryModal from './ExerciseLibraryModal';
import SavedWorkoutCard from './SavedWorkoutCard';
import ErrorPopup from '../common/ErrorPopup';

const SORT_OPTIONS = [
  { value: 'recent_to_oldest', label: 'Recent to Oldest' },
  { value: 'oldest_to_recent', label: 'Oldest to Recent' },
  { value: 'least_exercises_to_most', label: 'Least Exercises to Most' },
  { value: 'most_exercises_to_least', label: 'Most Exercises to Least' },
];

function getWorkoutTime(workout) {
  const raw = workout?.created_at ?? workout?.createdAt ?? workout?.date_created ?? null;
  const parsed = raw ? Date.parse(raw) : Number.NaN;
  if (!Number.isNaN(parsed)) return parsed;

  const numericId = Number(workout?.id);
  return Number.isFinite(numericId) ? numericId : 0;
}

function getExerciseCount(workout) {
  return Array.isArray(workout?.exercises) ? workout.exercises.length : 0;
}

function CustomCreatorView() {
  const [saveErrorMessage, setSaveErrorMessage] = useState('');
  const [showSavedWorkouts, setShowSavedWorkouts] = useState(true);
  const [savedSort, setSavedSort] = useState('recent_to_oldest');

  const {
    workoutName,
    setWorkoutName,
    rows,
    updateRow,
    moveRow,
    removeRow,
    addRowAfter,
    saveWorkout,
    savedWorkouts,
    expandedIds,
    toggleExpanded,
    showLibrary,
    setShowLibrary,
    openLibrary,
    libraryFilter,
    setLibraryFilter,
    librarySearch,
    setLibrarySearch,
    filteredLibrary,
    libraryLoading,
    addExerciseFromLibrary,
    handleCustomize,
    handleBegin,
    handleDelete,
  } = useCustomCreatorView();

  const displayedWorkouts = useMemo(() => {
    const sorted = [...savedWorkouts];

    sorted.sort((a, b) => {
      if (savedSort === 'oldest_to_recent') {
        return getWorkoutTime(a) - getWorkoutTime(b);
      }

      if (savedSort === 'least_exercises_to_most') {
        return getExerciseCount(a) - getExerciseCount(b);
      }

      if (savedSort === 'most_exercises_to_least') {
        return getExerciseCount(b) - getExerciseCount(a);
      }

      return getWorkoutTime(b) - getWorkoutTime(a);
    });

    return sorted;
  }, [savedSort, savedWorkouts]);

  async function handleSave() {
    const result = await saveWorkout();
    if (!result?.ok) {
      setSaveErrorMessage(result?.error || 'Unable to save workout.');
    }
  }

  function handleAddRowAfter(rowId) {
    const result = addRowAfter(rowId);
    if (result?.limitReached) {
      setSaveErrorMessage('A workout can have at most 16 exercises. Please remove one before adding more.');
    }
  }

  return (
    <section className="wt-view-content active">
      <WorkoutBuilderForm
        workoutName={workoutName}
        onNameChange={setWorkoutName}
        rows={rows}
        onUpdateRow={updateRow}
        onMoveRow={moveRow}
        onRemoveRow={removeRow}
        onAddRowAfter={handleAddRowAfter}
        onOpenLibraryForRow={openLibrary}
        onSave={handleSave}
      />

      <ErrorPopup
        message={saveErrorMessage}
        onClose={() => setSaveErrorMessage('')}
      />

      {showLibrary && (
        <ExerciseLibraryModal
          onClose={() => setShowLibrary(false)}
          libraryFilter={libraryFilter}
          onFilterChange={(val) => { setLibraryFilter(val); setLibrarySearch(''); }}
          librarySearch={librarySearch}
          onSearchChange={setLibrarySearch}
          filteredLibrary={filteredLibrary}
          libraryLoading={libraryLoading}
          onSelect={addExerciseFromLibrary}
        />
      )}

      <section className="wt-saved-workouts">
        <div className="wt-saved-header">
          <h3>Your Saved Workouts</h3>
          <div className="wt-saved-controls">
            <label className="wt-saved-filter" htmlFor="savedWorkoutsSort">
              Sort By
              <select
                id="savedWorkoutsSort"
                value={savedSort}
                onChange={(e) => setSavedSort(e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="btn wt-saved-toggle"
              onClick={() => setShowSavedWorkouts((prev) => !prev)}
            >
              {showSavedWorkouts ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {showSavedWorkouts && (
          <div id="savedWorkoutsContainer" className="wt-templates-grid">
            {savedWorkouts.length === 0 ? (
              <p className="wt-empty-state">No saved workouts yet. Create one above!</p>
            ) : (
              displayedWorkouts.map((workout) => (
                <SavedWorkoutCard
                  key={workout.id}
                  workout={workout}
                  isExpanded={expandedIds.has(workout.id)}
                  onToggle={() => toggleExpanded(workout.id)}
                  onCustomize={() => handleCustomize(workout)}
                  onBegin={() => handleBegin(workout)}
                  onDelete={() => handleDelete(workout)}
                />
              ))
            )}
          </div>
        )}
      </section>
    </section>
  );
}

export default CustomCreatorView;
