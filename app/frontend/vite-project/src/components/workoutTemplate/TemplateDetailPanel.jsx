import { useNavigate } from 'react-router-dom';
import ModalShell from '../common/ModalShell';

function TemplateDetailPanel({ template, exercises, loading, onClose }) {
  const navigate = useNavigate();

  function beginWorkout() {
    sessionStorage.setItem('activeWorkoutSource', 'template');
    sessionStorage.setItem('activeWorkoutId', String(template.id));
    sessionStorage.setItem('activeWorkoutName', template.name);
    navigate(`/active-workout?source=template&id=${template.id}`);
  }

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={template.name}
      className="wt-detail-panel"
      backdropClassName="wt-detail-overlay"
    >

        <h2 className="wt-detail-title">{template.name}</h2>
        {template.description && (
          <p className="wt-detail-description">{template.description}</p>
        )}

        {loading ? (
          <p className="wt-detail-loading">Loading exercises...</p>
        ) : (
          <ul className="wt-detail-exercise-list">
            {exercises.map((ex, i) => {
              const d = ex.details || {};
              return (
                <li key={i} className="wt-detail-exercise-item">
                  {d.image_url && (
                    <img src={d.image_url} alt={d.name} className="wt-detail-exercise-img" />
                  )}
                  <div className="wt-detail-exercise-info">
                    <h4>{d.name || ex.exercise_id}</h4>
                    {(d.muscle_group || d.equipment) && (
                      <p className="wt-detail-exercise-meta">
                        {[d.muscle_group, d.equipment].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="wt-detail-exercise-sets">
                      {ex.target_sets} sets × {ex.target_reps} reps
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <button className="btn wt-btn-full" onClick={beginWorkout}>
          Begin Workout
        </button>
    </ModalShell>
  );
}

export default TemplateDetailPanel;
