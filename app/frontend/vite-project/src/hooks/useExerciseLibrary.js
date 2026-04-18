import { useState, useEffect } from 'react';
import { getExercises } from '../utils/api';

export function useExerciseLibrary() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getExercises(activeFilter)
      .then((data) => setExercises(data))
      .catch((err) => setError(err.message || 'Failed to load exercises. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  return {
    activeFilter,
    setActiveFilter,
    selectedExercise,
    setSelectedExercise,
    exercises,
    loading,
    error,
  };
}
