function ExerciseRow({ row, onUpdate, onRemove }) {
  return (
    <tr>
      <td>
        <input
          type="text"
          value={row.exercise}
          placeholder="Type or add from library..."
          onChange={(e) => onUpdate(row.id, 'exercise', e.target.value)}
        />
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
