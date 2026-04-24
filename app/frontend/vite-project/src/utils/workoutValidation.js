export function validateWorkoutBeforeSave({ workoutName, rows, savedWorkouts = [] }) {
  const trimmedName = (workoutName || '').trim();
  if (!trimmedName) {
    return 'Please enter a workout name before saving.';
  }

  const normalizedName = trimmedName.toLowerCase();
  const hasDuplicateName = Array.isArray(savedWorkouts)
    && savedWorkouts.some((workout) => (workout?.name || '').trim().toLowerCase() === normalizedName);

  if (hasDuplicateName) {
    return 'A saved workout with this name already exists. Please choose a different name.';
  }

  const hasAtLeastOneExercise = Array.isArray(rows)
    && rows.some((row) => (row?.exercise || '').trim().length > 0);

  if (!hasAtLeastOneExercise) {
    return 'You need to put an exercise in order to save it.';
  }

  return null;
}
