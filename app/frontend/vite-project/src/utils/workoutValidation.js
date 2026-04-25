export const MAX_SAVED_WORKOUTS = 16;
export const MAX_EXERCISES_PER_WORKOUT = 16;
export const MAX_NAME_CHARS = 50;

export function validateWorkoutBeforeSave({ workoutName, rows, savedWorkouts = [] }) {
  const trimmedName = (workoutName || '').trim();
  if (!trimmedName) {
    return 'Please enter a workout name before saving.';
  }

  if (trimmedName.length > MAX_NAME_CHARS) {
    return `Workout name must be ${MAX_NAME_CHARS} characters or fewer.`;
  }

  if (Array.isArray(savedWorkouts) && savedWorkouts.length >= MAX_SAVED_WORKOUTS) {
    return `You've reached the limit of ${MAX_SAVED_WORKOUTS} saved workouts. Please delete one before saving a new one.`;
  }

  const normalizedName = trimmedName.toLowerCase();
  const hasDuplicateName = Array.isArray(savedWorkouts)
    && savedWorkouts.some((workout) => (workout?.name || '').trim().toLowerCase() === normalizedName);

  if (hasDuplicateName) {
    return 'A saved workout with this name already exists. Please choose a different name.';
  }

  const filledRows = Array.isArray(rows)
    ? rows.filter((row) => (row?.exercise || '').trim().length > 0)
    : [];

  if (filledRows.length === 0) {
    return 'You need to put an exercise in order to save it.';
  }

  if (filledRows.length > MAX_EXERCISES_PER_WORKOUT) {
    return `A workout can have at most ${MAX_EXERCISES_PER_WORKOUT} exercises. Please remove some before saving.`;
  }

  return null;
}
