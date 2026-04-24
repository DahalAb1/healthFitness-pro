import { useCustomCreatorView } from '../../hooks/useCustomCreatorView';
import WorkoutBuilderForm from './WorkoutBuilderForm';
import ExerciseLibraryModal from './ExerciseLibraryModal';
import SavedWorkoutCard from './SavedWorkoutCard';

function CustomCreatorView() {
  const {
    workoutName,
    setWorkoutName,
    rows,
    updateRow,
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
  return (
    <section className="wt-view-content active">
      <WorkoutBuilderForm
        workoutName={workoutName}
        onNameChange={setWorkoutName}
        rows={rows}
        onUpdateRow={updateRow}
        onRemoveRow={removeRow}
        onAddRowAfter={addRowAfter}
        onOpenLibraryForRow={openLibrary}
        onSave={saveWorkout}
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
        <h3>Your Saved Workouts</h3>

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
      </section>
    </section>
  );
}

export default CustomCreatorView;
