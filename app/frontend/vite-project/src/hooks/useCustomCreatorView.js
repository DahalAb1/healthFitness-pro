import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postUserWorkout, getUserWorkouts, deleteUserWorkout, getExercises } from '../utils/api';
import { useAuth } from '../context/useAuth';
import { validateWorkoutBeforeSave } from '../utils/workoutValidation';

export const BODY_PARTS = ['ALL', 'CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'LEGS', 'ABS', 'CARDIO'];

function createEmptyRow() {
  return {
    id: crypto.randomUUID(),
    exerciseId: null,
    exercise: '',
    sets: 3,
    reps: 10,
    rest: '60s',
  };
}

export function useCustomCreatorView() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [workoutName, setWorkoutName] = useState('');
  const [rows, setRows] = useState([createEmptyRow()]);
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryTargetRowId, setLibraryTargetRowId] = useState(null);
  const [libraryFilter, setLibraryFilter] = useState('ALL');
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryItems, setLibraryItems] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  const filteredLibrary = libraryItems.filter((ex) => {
    if (!librarySearch.trim()) return true;
    return ex.name?.toLowerCase().includes(librarySearch.trim().toLowerCase());
  });

  function toggleExpanded(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleCustomize(workout) {
    setWorkoutName(workout.name || '');
    setRows(
      (workout.exercises || []).map((ex) => ({
        id: crypto.randomUUID(),
        exerciseId: ex.exercise_id || null,
        exercise: ex.exercise_name || '',
        sets: ex.sets || 3,
        reps: ex.reps || 10,
        rest: '60s',
      }))
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBegin(workout) {
    sessionStorage.setItem('activeWorkoutName', workout.name || 'Custom Workout');
    sessionStorage.setItem('activeWorkoutExercises', JSON.stringify(workout.exercises || []));
    navigate(`/active-workout?source=custom&id=${workout.id}`);
  }

  function handleDelete(workout) {
    deleteUserWorkout(workout.id, token).then(() => {
      setSavedWorkouts((prev) => prev.filter((w) => w.id !== workout.id));
    });
  }

  function openLibrary(rowId = null) {
    setLibraryTargetRowId(rowId);
    setLibraryLoading(true);
    setLibraryItems([]);
    setShowLibrary(true);
  }

  function addExerciseFromLibrary(exercise) {
    if (!libraryTargetRowId) {
      setShowLibrary(false);
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === libraryTargetRowId
          ? {
              ...row,
              exerciseId: exercise.id || null,
              exercise: exercise.name || '',
            }
          : row
      )
    );
    setLibraryTargetRowId(null);
    setShowLibrary(false);
  }

  function addRowAfter(rowId) {
    setRows((prev) => {
      const index = prev.findIndex((row) => row.id === rowId);
      const next = [...prev];
      if (index === -1) {
        next.push(createEmptyRow());
        return next;
      }
      next.splice(index + 1, 0, createEmptyRow());
      return next;
    });
  }

  function removeRow(id) {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  }

  function updateRow(id, field, value) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }

  function moveRow(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) return;

    setRows((prev) => {
      const sourceIndex = prev.findIndex((row) => row.id === sourceId);
      const targetIndex = prev.findIndex((row) => row.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  async function saveWorkout() {
    const validationError = validateWorkoutBeforeSave({
      workoutName,
      rows,
      savedWorkouts,
    });
    if (validationError) {
      return { ok: false, error: validationError };
    }

    const trimmedName = workoutName.trim();
    const exercisesToSave = rows.filter((row) => (row.exercise || '').trim());

    try {
      const saved = await postUserWorkout(
        {
          name: trimmedName,
          exercises: exercisesToSave.map((row) => ({
            exercise_id: row.exerciseId || null,
            exercise_name: row.exercise,
            sets: row.sets,
            reps: row.reps,
          })),
        },
        token
      );

      // Re-sync from backend so the saved workout section always reflects server truth.
      const data = await getUserWorkouts(token);
      setSavedWorkouts(Array.isArray(data) ? data : []);

      setWorkoutName('');
      setRows([createEmptyRow()]);
      return { ok: true, saved };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unable to save workout right now.',
      };
    }
  }

  useEffect(() => {
    if (!token) return;
    getUserWorkouts(token).then((data) => setSavedWorkouts(Array.isArray(data) ? data : []));
  }, [token]);

  useEffect(() => {
    if (!showLibrary) return;
    getExercises(libraryFilter)
      .then((data) => setLibraryItems(Array.isArray(data) ? data : []))
      .finally(() => setLibraryLoading(false));
  }, [showLibrary, libraryFilter]);

  return {
    workoutName,
    setWorkoutName,
    rows,
    updateRow,
    moveRow,
    removeRow,
    addRowAfter,
    saveWorkout,
    savedWorkouts,
    expandedIds,
    toggleExpanded,
    showLibrary,
    setShowLibrary,
    openLibrary,
    libraryFilter,
    setLibraryFilter,
    librarySearch,
    setLibrarySearch,
    filteredLibrary,
    libraryLoading,
    addExerciseFromLibrary,
    handleCustomize,
    handleBegin,
    handleDelete,
  };
}
