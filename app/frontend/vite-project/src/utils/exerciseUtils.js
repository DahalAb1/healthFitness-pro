export const BODY_PART_MAP = {
  CHEST: 'chest',
  BACK: 'back',
  LEGS: 'upper legs',
  SHOULDERS: 'shoulders',
  BICEPS: 'biceps',
  TRICEPS: 'triceps',
  ABS: 'waist',
};

export function normalizeExercise(exercise) {
  const instructions = exercise.instructions;
  return {
    id: exercise.id,
    name: exercise.name,
    muscle_group: exercise.target || '',
    equipment: exercise.equipment || '',
    description: Array.isArray(instructions) ? instructions.join(' ') : (instructions || ''),
    image_url: exercise.gifUrl || '',
  };
}
