function ExerciseCard({ exercise, variant }) {
  if (!exercise) {
    return <div className={`aw-card aw-card-empty aw-card-${variant}`} />;
  }

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
        {(exercise.muscleGroup || exercise.equipment) && (
          <div className="aw-card-badges">
            {exercise.muscleGroup && (
              <span className="aw-badge aw-badge-muscle">{exercise.muscleGroup}</span>
            )}
            {exercise.equipment && (
              <span className="aw-badge aw-badge-equip">{exercise.equipment}</span>
            )}
          </div>
        )}
        {exercise.rest && <p className="aw-card-rest">Rest: {exercise.rest}</p>}
      </div>
    </div>
  );
}

export default ExerciseCard;
