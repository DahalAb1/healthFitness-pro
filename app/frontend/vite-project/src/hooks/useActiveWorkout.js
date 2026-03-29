import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getTemplateExercises, logWorkout, getExercises } from '../utils/api';
import { useAuth } from '../context/useAuth';
import { normalizeTemplateExercise, normalizeCustomExercise } from '../components/activeWorkout/exerciseNormalizers';

function buildSetLogs(exs) {
  return exs.map((ex) =>
    Array.from({ length: Math.max(1, ex.sets) }, () => ({
      weight: '',
      reps: String(ex.reps),
      done: false,
    }))
  );
}

export function useActiveWorkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [exercises, setExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [setLogs, setSetLogs] = useState([]);

  const startedAt = useRef(Date.now());

  function updateSetLog(exerciseIndex, setIndex, field, value) {
    setSetLogs((prev) =>
      prev.map((sets, i) =>
        i === exerciseIndex
          ? sets.map((s, j) => (j === setIndex ? { ...s, [field]: value } : s))
          : sets
      )
    );
  }

  useEffect(() => {
    const source = searchParams.get('source');
    const id = Number(searchParams.get('id'));
    const name = sessionStorage.getItem('activeWorkoutName') || 'Workout';

    if (!source || !id) {
      navigate('/workout-template');
      return;
    }

    setWorkoutName(name);

    if (source === 'template') {
      getTemplateExercises(id)
        .then((data) => {
          const normalized = (data.exercises || []).map(normalizeTemplateExercise);
          setExercises(normalized);
          setSetLogs(buildSetLogs(normalized));
        })
        .catch(() => setExercises([]))
        .finally(() => setLoading(false));
    } else if (source === 'custom') {
      const raw = sessionStorage.getItem('activeWorkoutExercises');
      const exs = raw ? JSON.parse(raw) : [];
      const normalized = exs.map(normalizeCustomExercise);
      setExercises(normalized);
      setSetLogs(buildSetLogs(normalized));
      setLoading(false);

      // Enrich with images/muscle info by matching exercise names against the library
      getExercises('ALL')
        .then((libraryItems) => {
          if (!libraryItems || libraryItems.length === 0) return;
          setExercises((prev) =>
            prev.map((ex) => {
              if (ex.imageUrl) return ex;
              const nameLower = ex.name.trim().toLowerCase();
              const match =
                libraryItems.find((item) => item.name?.trim().toLowerCase() === nameLower) ||
                libraryItems.find((item) => {
                  const n = (item.name || '').trim().toLowerCase();
                  return n.includes(nameLower) || nameLower.includes(n);
                });
              if (!match) return ex;
              return {
                ...ex,
                imageUrl: match.image_url || '',
                muscleGroup: ex.muscleGroup || match.muscle_group || '',
                equipment: ex.equipment || match.equipment || '',
              };
            }),
          );
        })
        .catch(() => {}); // silently ignore — images are optional
    } else {
      navigate('/workout-template');
    }
  }, []);

  async function finish() {
    if (finishing) return;
    setFinishing(true);

    const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    const today = new Date().toISOString().split('T')[0];

    const exercisesToLog = exercises.map((ex, idx) => {
      const logs = setLogs[idx] || [];
      const doneLogs = logs.filter((s) => s.done);
      const active = doneLogs.length > 0 ? doneLogs : logs;
      const avgReps =
        active.length > 0
          ? Math.round(
              active.reduce((sum, s) => sum + (Number(s.reps) || ex.reps), 0) / active.length,
            )
          : ex.reps;
      const maxWeight = active.reduce((max, s) => Math.max(max, Number(s.weight) || 0), 0);
      const countSets = doneLogs.length > 0 ? doneLogs.length : ex.sets;
      return {
        exercise_name: ex.name.slice(0, 80),
        sets: Math.min(50, Math.max(1, countSets)),
        reps: Math.min(200, Math.max(1, avgReps)),
        weight: Math.min(2000, Math.max(0, maxWeight)),
      };
    });

    try {
      await logWorkout({
        workout_date: today,
        duration_minutes: durationMinutes,
        exercises: exercisesToLog,
      }, token);
    } catch (err) {
      console.error('Failed to log workout:', err);
      window.alert('Workout finished, but could not save to history. Is the backend running?');
    }

    sessionStorage.removeItem('activeWorkoutName');
    sessionStorage.removeItem('activeWorkoutExercises');

    navigate('/workout-history');
  }

  function handleNext() {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finish();
    }
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function handleEnd() {
    if (window.confirm('End this workout early? Your progress will be saved.')) {
      finish();
    }
  }

  return {
    exercises,
    workoutName,
    currentIndex,
    loading,
    finishing,
    setLogs,
    handleNext,
    handleBack,
    handleEnd,
    updateSetLog,
  };
}
