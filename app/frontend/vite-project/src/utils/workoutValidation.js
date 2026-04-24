export function validateWorkoutBeforeSave({ workoutName, rows }) {
  const trimmedName = (workoutName || '').trim();
  if (!trimmedName) {
    return 'Please enter a workout name before saving.';
  }

  const hasAtLeastOneExercise = Array.isArray(rows)
    && rows.some((row) => (row?.exercise || '').trim().length > 0);

  if (!hasAtLeastOneExercise) {
    return 'You need to put an exercise in order to save it.';
  }

  return null;
}
