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
        <div className="el-badges">
          {exercise.muscle_group && (
            <span className="el-badge el-badge-muscle">{exercise.muscle_group}</span>
          )}
          {exercise.equipment && (
            <span className="el-badge el-badge-equipment">{exercise.equipment}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseCard;
