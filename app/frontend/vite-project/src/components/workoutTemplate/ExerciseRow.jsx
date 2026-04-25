function ExerciseRow({
  row,
  onUpdate,
  isDragging,
  isDropTarget,
  onDragStartRow,
  onDragOverRow,
  onDropRow,
  onDragEndRow,
  onRemove,
  onAddRowAfter,
  onOpenLibraryForRow,
}) {
  const rowClassName = [
    'wt-row-draggable',
    isDragging ? 'wt-row-dragging' : '',
    isDropTarget ? 'wt-row-drop-target' : '',
  ].filter(Boolean).join(' ');

  return (
    <tr
      className={rowClassName}
      draggable
      onDragStart={(event) => onDragStartRow(row.id, event)}
      onDragOver={(event) => onDragOverRow(row.id, event)}
      onDrop={(event) => onDropRow(row.id, event)}
      onDragEnd={onDragEndRow}
      title="Drag to reorder exercises"
    >
      <td className="wt-col-action-cell">
        <button
          type="button"
          className="wt-add-row-btn"
          draggable={false}
          onClick={() => onAddRowAfter(row.id)}
          aria-label="Add exercise row"
        >
          <span className="wt-add-row-icon" aria-hidden="true">+</span>
        </button>
      </td>
      <td className="wt-cell-exercise">
        <button
          type="button"
          className="wt-row-library-btn"
          draggable={false}
          onClick={() => onOpenLibraryForRow(row.id)}
          aria-label={row.exercise ? 'Change exercise for row' : 'Add exercise from library for row'}
        >
          {row.exercise || 'Add Exercise'}
        </button>
      </td>
      <td className="wt-cell-sets">
        <input
          type="number"
          draggable={false}
          value={row.sets}
          onChange={(e) => onUpdate(row.id, 'sets', Number(e.target.value))}
        />
      </td>
      <td className="wt-cell-reps">
        <input
          type="number"
          draggable={false}
          value={row.reps}
          onChange={(e) => onUpdate(row.id, 'reps', Number(e.target.value))}
        />
      </td>
      <td className="wt-cell-rest">
        <input
          type="text"
          draggable={false}
          value={row.rest}
          onChange={(e) => onUpdate(row.id, 'rest', e.target.value)}
        />
      </td>
      <td className="wt-col-action-cell">
        <button
          type="button"
          className="wt-remove-btn"
          draggable={false}
          onClick={() => onRemove(row.id)}
          aria-label="Remove exercise row"
        >
          <span className="wt-remove-row-icon" aria-hidden="true">×</span>
        </button>
      </td>
    </tr>
  );
}

export default ExerciseRow;
