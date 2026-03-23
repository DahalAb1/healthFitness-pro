export const BODY_PART_MAP = {
  CHEST: 'chest',
  BACK: 'back',
  LEGS: 'thighs',
  SHOULDERS: 'shoulders',
  BICEPS: 'biceps',
  TRICEPS: 'triceps',
  ABS: 'waist',
};

export function normalizeExercise(exercise) {
  return {
    id: exercise.exerciseId || exercise.id,
    name: exercise.name,
    muscle_group:
      (exercise.targetMuscles && exercise.targetMuscles[0]) ||
      (exercise.bodyParts && exercise.bodyParts[0]) ||
      exercise.target || '',
    equipment:
      (exercise.equipments && exercise.equipments[0]) ||
      exercise.equipment || '',
    description: exercise.instructions || exercise.steps || exercise.guide || '',
    image_url: exercise.imageUrl || exercise.gifUrl || exercise.image_url || '',
  };
}

export function unwrapExerciseList(data) {
  return Array.isArray(data)
    ? data
    : Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.exercises)
        ? data.exercises
        : [];
}
