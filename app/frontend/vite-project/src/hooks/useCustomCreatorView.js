import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postUserWorkout, getUserWorkouts, deleteUserWorkout, getExercises } from '../utils/api';
import { useAuth } from '../context/useAuth';

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
  const { token, user } = useAuth();

  const [workoutName, setWorkoutName] = useState('');
  const [rows, setRows] = useState([createEmptyRow()]);
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const [showLibrary, setShowLibrary] = useState(false);
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
    if (!window.confirm(`Delete "${workout.name}"?`)) return;
    deleteUserWorkout(workout.id, user?.id).then(() => {
      setSavedWorkouts((prev) => prev.filter((w) => w.id !== workout.id));
    });
  }

  function addExerciseFromLibrary(exercise) {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        exerciseId: exercise.id || null,
        exercise: exercise.name || '',
        sets: 3,
        reps: 10,
        rest: '60s',
      },
    ]);
    setShowLibrary(false);
  }

  function removeRow(id) {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  }

  function updateRow(id, field, value) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }

  function saveWorkout() {
    const trimmedName = workoutName.trim();
    if (!trimmedName) {
      window.alert('Please enter a workout name before saving.');
      return;
    }
    postUserWorkout(
      {
        name: trimmedName,
        exercises: rows.map((row) => ({
          exercise_id: row.exerciseId || null,
          exercise_name: row.exercise,
          sets: row.sets,
          reps: row.reps,
        })),
      },
      token
    ).then((saved) => {
      setSavedWorkouts((prev) => [...prev, saved]);
    });
    setWorkoutName('');
    setRows([createEmptyRow()]);
  }

  useEffect(() => {
    if (!token) return;
    getUserWorkouts(token).then((data) => setSavedWorkouts(Array.isArray(data) ? data : []));
  }, [token]);

  useEffect(() => {
    if (!showLibrary) return;
    setLibraryLoading(true);
    setLibraryItems([]);
    getExercises(libraryFilter)
      .then((data) => setLibraryItems(Array.isArray(data) ? data : []))
      .finally(() => setLibraryLoading(false));
  }, [showLibrary, libraryFilter]);

  return {
    workoutName,
    setWorkoutName,
    rows,
    updateRow,
    removeRow,
    saveWorkout,
    savedWorkouts,
    expandedIds,
    toggleExpanded,
    showLibrary,
    setShowLibrary,
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
