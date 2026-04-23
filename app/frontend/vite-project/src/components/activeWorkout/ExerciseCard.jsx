import ExerciseBadges from '../common/ExerciseBadges';

function ExerciseCard({ exercise, variant, setLogs, onSetUpdate }) {
  if (!exercise) {
    return <div className={`aw-card aw-card-empty aw-card-${variant}`} />;
  }

  const isCurrent = variant === 'current';

  return (
    <div className={`aw-card aw-card-${variant}`}>
      {exercise.imageUrl ? (
        <img src={exercise.imageUrl} alt={exercise.name} className="aw-card-img" />
      ) : (
        <div className="aw-card-img-placeholder" />
      )}
      <div className="aw-card-body">
        <h3 className="aw-card-name">{exercise.name}</h3>
        <p className="aw-card-sets">{exercise.sets} sets × {exercise.reps} reps</p>
        <ExerciseBadges
          muscleGroup={exercise.muscleGroup}
          equipment={exercise.equipment}
          badgeClass="aw-badge"
          className="aw-card-badges"
        />
        {exercise.rest && <p className="aw-card-rest">Rest: {exercise.rest}</p>}

        {isCurrent && setLogs && (
          <div className="aw-set-logger">
            <table className="aw-set-table">
              <thead>
                <tr>
                  <th>Set</th>
                  <th>Target</th>
                  <th>Weight (lbs)</th>
                  <th>Reps Done</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {setLogs.map((s, i) => (
                  <tr key={i} className={s.done ? 'aw-set-row-done' : ''}>
                    <td className="aw-set-num">{i + 1}</td>
                    <td className="aw-set-target">{exercise.reps}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="aw-set-input"
                        placeholder="0"
                        value={s.weight}
                        onChange={(e) => onSetUpdate(i, 'weight', e.target.value)}
                        disabled={s.done}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        className="aw-set-input"
                        placeholder={String(exercise.reps)}
                        value={s.reps}
                        onChange={(e) => onSetUpdate(i, 'reps', e.target.value)}
                        disabled={s.done}
                      />
                    </td>
                    <td>
                      <button
                        className={`aw-set-check${s.done ? ' aw-set-check-done' : ''}`}
                        onClick={() => onSetUpdate(i, 'done', !s.done)}
                        title={s.done ? 'Undo' : 'Mark complete'}
                      >
                        {s.done ? '✓' : '○'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExerciseCard;
