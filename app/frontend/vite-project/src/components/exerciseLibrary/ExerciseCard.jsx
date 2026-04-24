import ExerciseBadges from '../common/ExerciseBadges';

function ExerciseCard({ exercise, onClick }) {
  return (
    <div
      className="el-card"
      role="button"
      tabIndex={0}
      aria-label={`View details for ${exercise.name}`}
      onClick={() => onClick(exercise)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(exercise);
        }
      }}
    >
      <img
        className="el-card-image"
        src={exercise.image_url}
        alt={exercise.name}
        loading="lazy"
        onError={(e) => { e.currentTarget.style.background = '#222'; }}
      />
      <div className="el-card-body">
        <div className="el-card-name">{exercise.name}</div>
        <ExerciseBadges
          muscleGroup={exercise.muscle_group}
          equipment={exercise.equipment}
          badgeClass="el-badge"
          className="el-badges"
        />
      </div>
    </div>
  );
}

export default ExerciseCard;
