function ExerciseRow({ row, onUpdate, onRemove, onAddRowAfter, onOpenLibraryForRow }) {
  return (
    <tr>
      <td className="wt-col-action-cell">
        <button
          type="button"
          className="wt-add-row-btn"
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
          onClick={() => onOpenLibraryForRow(row.id)}
          aria-label={row.exercise ? 'Change exercise for row' : 'Add exercise from library for row'}
        >
          {row.exercise || 'Add Exercise'}
        </button>
      </td>
      <td className="wt-cell-sets">
        <input
          type="number"
          value={row.sets}
          onChange={(e) => onUpdate(row.id, 'sets', Number(e.target.value))}
        />
      </td>
      <td className="wt-cell-reps">
        <input
          type="number"
          value={row.reps}
          onChange={(e) => onUpdate(row.id, 'reps', Number(e.target.value))}
        />
      </td>
      <td className="wt-cell-rest">
        <input
          type="text"
          value={row.rest}
          onChange={(e) => onUpdate(row.id, 'rest', e.target.value)}
        />
      </td>
      <td className="wt-col-action-cell">
        <button
          type="button"
          className="wt-remove-btn"
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
