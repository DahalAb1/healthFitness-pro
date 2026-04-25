import { useState } from 'react';
import ExerciseRow from './ExerciseRow';
import { MAX_NAME_CHARS } from '../../utils/workoutValidation';

function WorkoutBuilderForm({ workoutName, onNameChange, rows, onUpdateRow, onMoveRow, onRemoveRow, onAddRowAfter, onOpenLibraryForRow, onSave }) {
  const [draggingRowId, setDraggingRowId] = useState(null);
  const [dropTargetRowId, setDropTargetRowId] = useState(null);

  function handleRowDragStart(rowId, event) {
    event.dataTransfer.effectAllowed = 'move';
    setDraggingRowId(rowId);
  }

  function handleRowDragOver(rowId, event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropTargetRowId(rowId);
  }

  function handleRowDrop(rowId, event) {
    event.preventDefault();
    if (draggingRowId && draggingRowId !== rowId) {
      onMoveRow(draggingRowId, rowId);
    }
    setDropTargetRowId(null);
    setDraggingRowId(null);
  }

  function handleRowDragEnd() {
    setDropTargetRowId(null);
    setDraggingRowId(null);
  }

  return (
    <div className="wt-card">
      <h2>Create a New Workout</h2>

      <div className="wt-input-group">
        <label htmlFor="workoutName">WORKOUT NAME</label>
        <input
          id="workoutName"
          type="text"
          value={workoutName}
          placeholder="e.g. Hypertrophy Upper Body"
          onChange={(e) => onNameChange(e.target.value)}
        />
        <span className={`wt-char-counter${workoutName.length > MAX_NAME_CHARS ? ' wt-char-counter--over' : ''}`}>
          {workoutName.length} / {MAX_NAME_CHARS}
        </span>
      </div>

      <div className="wt-table-container">
        <table className="wt-workout-table" id="exerciseTable">
          <thead>
            <tr>
              <th className="wt-col-action" aria-label="Add row" />
              <th className="wt-col-exercise">Exercise</th>
              <th className="wt-col-sets">Sets</th>
              <th className="wt-col-reps">Reps</th>
              <th className="wt-col-rest">Rest</th>
              <th className="wt-col-action" aria-label="Remove row" />
            </tr>
          </thead>
          <tbody id="exerciseBody">
            {rows.map((row) => (
              <ExerciseRow
                key={row.id}
                row={row}
                onUpdate={onUpdateRow}
                isDragging={draggingRowId === row.id}
                isDropTarget={dropTargetRowId === row.id && draggingRowId !== row.id}
                onDragStartRow={handleRowDragStart}
                onDragOverRow={handleRowDragOver}
                onDropRow={handleRowDrop}
                onDragEndRow={handleRowDragEnd}
                onRemove={onRemoveRow}
                onAddRowAfter={onAddRowAfter}
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
