import { useState } from 'react';
import WorkoutCard from '../common/WorkoutCard';

function SavedWorkoutCard({ workout, isExpanded, onToggle, onCustomize, onBegin, onDelete }) {
  const exerciseCount = workout.exercises?.length ?? 0;
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <WorkoutCard
      title={workout.name}
      subtitle="Custom routine"
      exerciseCount={exerciseCount}
      actions={
        <>
          <button type="button" className="btn wt-card-btn wt-btn-view" onClick={onToggle}>
            {isExpanded ? 'Hide' : 'View'}
          </button>
          <button type="button" className="btn wt-card-btn wt-btn-customize" onClick={onCustomize}>
            Customize
          </button>
          <button type="button" className="btn wt-card-btn wt-btn-begin" onClick={onBegin}>
            Begin
          </button>
          <button
            type="button"
            className="btn wt-card-btn wt-btn-delete"
            onClick={() => confirmingDelete ? onDelete() : setConfirmingDelete(true)}
          >
            {confirmingDelete ? 'Sure?' : 'Delete'}
          </button>
        </>
      }
    >
      {isExpanded && (workout.exercises || []).length > 0 && (
        <ul className="wt-card-exercise-list">
          {workout.exercises.map((ex, i) => (
            <li key={i} className="wt-card-exercise-item">
              <span className="wt-card-exercise-name">{ex.exercise_name}</span>
              <span className="wt-card-exercise-meta">{ex.sets}×{ex.reps}</span>
            </li>
          ))}
        </ul>
      )}
    </WorkoutCard>
  );
}

export default SavedWorkoutCard;
