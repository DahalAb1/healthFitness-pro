import { useState } from 'react';
import { useCustomCreatorView } from '../../hooks/useCustomCreatorView';
import WorkoutBuilderForm from './WorkoutBuilderForm';
import ExerciseLibraryModal from './ExerciseLibraryModal';
import SavedWorkoutCard from './SavedWorkoutCard';
import ErrorPopup from '../common/ErrorPopup';

function CustomCreatorView() {
  const [saveErrorMessage, setSaveErrorMessage] = useState('');
  const [showSavedWorkouts, setShowSavedWorkouts] = useState(true);

  const {
    workoutName,
    setWorkoutName,
    workoutNotes,
    setWorkoutNotes,
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
        workoutNotes={workoutNotes}
        onNotesChange={setWorkoutNotes}
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
          <button
            type="button"
            className="btn wt-saved-toggle"
            onClick={() => setShowSavedWorkouts((prev) => !prev)}
          >
            {showSavedWorkouts ? 'Hide' : 'Show'}
          </button>
        </div>

        {showSavedWorkouts && (
          <div id="savedWorkoutsContainer" className="wt-templates-grid">
            {savedWorkouts.length === 0 ? (
              <p className="wt-empty-state">No saved workouts yet. Create one above!</p>
            ) : (
              savedWorkouts.map((workout) => (
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
