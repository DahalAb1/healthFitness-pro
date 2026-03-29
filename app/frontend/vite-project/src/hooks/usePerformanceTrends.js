import { useState, useEffect, useMemo } from 'react';
import { getProgressWeights } from '../utils/api';
import { useAuth } from '../context/useAuth';

const FILTER_DAYS = { day: 7, week: 30, month: Infinity };

export function usePerformanceTrends() {
  const { token } = useAuth();
  const [filter, setFilter] = useState('month');
  const [inputValue, setInputValue] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [allPoints, setAllPoints] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!exerciseName || !token) return;
    setLoading(true);
    setError(null);
    getProgressWeights(token, exerciseName)
      .then((data) => {
        setAllPoints(data.points || []);
        setMeta(data);
      })
      .catch(() => {
        setError('No progress data found for this exercise.');
        setAllPoints([]);
        setMeta(null);
      })
      .finally(() => setLoading(false));
  }, [exerciseName, token]);

  const filteredPoints = useMemo(() => {
    const maxDays = FILTER_DAYS[filter];
    if (maxDays === Infinity) return allPoints;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxDays);
    return allPoints.filter((p) => new Date(p.date + 'T00:00:00') >= cutoff);
  }, [allPoints, filter]);

  const chartData = {
    labels: filteredPoints.map((p) => p.date),
    datasets: [
      {
        label: 'Max Weight (lbs)',
        data: filteredPoints.map((p) => p.weight),
        borderColor: '#4A90FF',
        backgroundColor: 'rgba(74, 144, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  function handleSearch(e) {
    e.preventDefault();
    const name = inputValue.trim();
    if (name) setExerciseName(name);
  }

  return {
    filter,
    setFilter,
    inputValue,
    setInputValue,
    exerciseName,
    meta,
    loading,
    error,
    filteredPoints,
    chartData,
    handleSearch,
  };
}
