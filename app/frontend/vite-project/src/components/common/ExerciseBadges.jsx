function ExerciseBadges({ muscleGroup, equipment, badgeClass = 'badge', className = 'exercise-badges' }) {
  if (!muscleGroup && !equipment) return null;
  return (
    <div className={className}>
      {muscleGroup && <span className={`${badgeClass} ${badgeClass}-muscle`}>{muscleGroup}</span>}
      {equipment && <span className={`${badgeClass} ${badgeClass}-equipment`}>{equipment}</span>}
    </div>
  );
}

export default ExerciseBadges;
