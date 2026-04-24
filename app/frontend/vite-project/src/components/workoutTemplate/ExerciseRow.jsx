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
          +
        </button>
      </td>
      <td>
        <button
          type="button"
          className="wt-row-library-btn"
          onClick={() => onOpenLibraryForRow(row.id)}
          aria-label={row.exercise ? `Change exercise for row` : `Add exercise `}
        >
          {row.exercise || 'Add Exercise '}
        </button>
      </td>
      <td>
        <input
          type="number"
          value={row.sets}
          onChange={(e) => onUpdate(row.id, 'sets', Number(e.target.value))}
        />
      </td>
      <td>
        <input
          type="number"
          value={row.reps}
          onChange={(e) => onUpdate(row.id, 'reps', Number(e.target.value))}
        />
      </td>
      <td>
        <input
          type="text"
          value={row.rest}
          onChange={(e) => onUpdate(row.id, 'rest', e.target.value)}
        />
      </td>
      <td>
        <button
          type="button"
          className="wt-remove-btn"
          onClick={() => onRemove(row.id)}
          aria-label="Remove exercise row"
        >
          ×
        </button>
      </td>
    </tr>
  );
}

export default ExerciseRow;
