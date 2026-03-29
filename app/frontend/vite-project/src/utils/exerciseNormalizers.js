export function normalizeTemplateExercise(ex) {
  const d = ex.details || {};
  return {
    name: d.name || ex.exercise_id || 'Exercise',
    sets: ex.target_sets || 3,
    reps: ex.target_reps || 10,
    muscleGroup: d.muscle_group || '',
    equipment: d.equipment || '',
    imageUrl: d.image_url || '',
    rest: null,
  };
}

export function normalizeCustomExercise(ex) {
  return {
    name: ex.exercise_name || 'Exercise',
    sets: ex.sets || 3,
    reps: ex.reps || 10,
    muscleGroup: '',
    equipment: '',
    imageUrl: '',
    rest: null,
  };
}
