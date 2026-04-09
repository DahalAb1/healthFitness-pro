import { useState, useEffect, useMemo } from 'react';
import { getNutritionTrends } from '../utils/api';
import { useAuth } from '../context/useAuth';

const FILTER_DAYS = { week: 7, month: 30, all: null };

export const MACRO_KEYS = ['kcal', 'protein', 'carbs', 'fat'];

export function useNutritionTrends() {
  const { token } = useAuth();
  const [filter, setFilter] = useState('month');
  const [activeMacro, setActiveMacro] = useState('kcal');
  const [allPoints, setAllPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all-time data once; client-side filter handles narrowing.
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    getNutritionTrends(token, null)
      .then((data) => setAllPoints(data))
      .catch(() => {
        setError('Could not load nutrition trends.');
        setAllPoints([]);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filteredPoints = useMemo(() => {
    const maxDays = FILTER_DAYS[filter];
    if (maxDays === null) return allPoints;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxDays + 1);
    cutoff.setHours(0, 0, 0, 0);
    return allPoints.filter((p) => new Date(p.date + 'T00:00:00') >= cutoff);
  }, [allPoints, filter]);

  const DATASET_MAP = useMemo(() => ({
    kcal: {
      label: 'Calories (kcal)',
      data: filteredPoints.map((p) => Math.round(p.kcal)),
      borderColor: '#4A90FF',
      backgroundColor: 'rgba(74, 144, 255, 0.1)',
      fill: true,
      tension: 0.4,
    },
    protein: {
      label: 'Protein (g)',
      data: filteredPoints.map((p) => Math.round(p.protein_g)),
      borderColor: '#4AFF8C',
      backgroundColor: 'rgba(74, 255, 140, 0.1)',
      fill: true,
      tension: 0.4,
    },
    carbs: {
      label: 'Carbs (g)',
      data: filteredPoints.map((p) => Math.round(p.carbs_g)),
      borderColor: '#FFC94A',
      backgroundColor: 'rgba(255, 201, 74, 0.1)',
      fill: true,
      tension: 0.4,
    },
    fat: {
      label: 'Fat (g)',
      data: filteredPoints.map((p) => Math.round(p.fat_g)),
      borderColor: '#FF8C4A',
      backgroundColor: 'rgba(255, 140, 74, 0.1)',
      fill: true,
      tension: 0.4,
    },
  }), [filteredPoints]);

  const chartData = useMemo(() => ({
    labels: filteredPoints.map((p) => p.date),
    datasets: [DATASET_MAP[activeMacro]],
  }), [DATASET_MAP, activeMacro, filteredPoints]);

  const summaryStats = useMemo(() => {
    if (filteredPoints.length === 0) return null;
    const avg = (key) =>
      Math.round(filteredPoints.reduce((s, p) => s + (p[key] || 0), 0) / filteredPoints.length);
    return {
      avgKcal: avg('kcal'),
      avgProtein: avg('protein_g'),
      avgCarbs: avg('carbs_g'),
      avgFat: avg('fat_g'),
      days: filteredPoints.length,
    };
  }, [filteredPoints]);

  return {
    filter,
    setFilter,
    activeMacro,
    setActiveMacro,
    filteredPoints,
    chartData,
    summaryStats,
    loading,
    error,
  };
}
