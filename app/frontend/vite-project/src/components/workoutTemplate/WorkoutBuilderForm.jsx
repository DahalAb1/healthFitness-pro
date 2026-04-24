import ExerciseRow from './ExerciseRow';

function WorkoutBuilderForm({ workoutName, onNameChange, rows, onUpdateRow, onRemoveRow, onOpenLibraryForRow, onSave }) {
  return (
    <div className="wt-card">
      <h2>Create New Routine</h2>

      <div className="wt-input-group">
        <label htmlFor="workoutName">WORKOUT NAME</label>
        <input
          id="workoutName"
          type="text"
          value={workoutName}
          placeholder="e.g. Hypertrophy Upper Body"
          onChange={(e) => onNameChange(e.target.value)}
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
              <ExerciseRow
                key={row.id}
                row={row}
                onUpdate={onUpdateRow}
                onRemove={onRemoveRow}
                onOpenLibraryForRow={onOpenLibraryForRow}
              />
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" className="btn wt-btn-full wt-btn-save" onClick={onSave}>
        Save Workout
      </button>
    </div>
  );
}

export default WorkoutBuilderForm;
