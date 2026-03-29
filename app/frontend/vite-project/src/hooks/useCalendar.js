import { useState, useEffect } from 'react';
import { getWorkoutByDate, getWorkouts, getMealLogs, getNutritionActiveDates } from '../utils/api';
import { useAuth } from '../context/useAuth';

const TODAY = new Date();

export function useCalendar() {
  const { token } = useAuth();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [mealLogs, setMealLogs] = useState([]);
  const [workoutDays, setWorkoutDays] = useState(new Set());
  const [nutritionDays, setNutritionDays] = useState(new Set());
  const [loadingDetail, setLoadingDetail] = useState(false);

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();

  const isCurrentMonth = year === TODAY.getFullYear() && month === TODAY.getMonth();
  const todayDay = isCurrentMonth ? TODAY.getDate() : null;

  useEffect(() => {
    if (!token) return;
    Promise.all([
      getWorkouts(token),
      getNutritionActiveDates(token, year, month + 1),
    ])
      .then(([sessions, nutData]) => {
        const workout_d = new Set();
        sessions.forEach((s) => {
          const [y, m, d] = s.workout_date.split('-').map(Number);
          if (y === year && m === month + 1) workout_d.add(d);
        });
        setWorkoutDays(workout_d);
        setNutritionDays(new Set(nutData.days));
      })
      .catch(() => {});
  }, [year, month, token]);

  function changeMonth(offset) {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + offset);
    setViewDate(d);
    setSelectedDay(null);
    setWorkout(null);
    setMealLogs([]);
  }

  function handleDayClick(day) {
    setSelectedDay(day);
    setWorkout(null);
    setMealLogs([]);
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setLoadingDetail(true);
    Promise.all([
      getWorkoutByDate(token, date).catch(() => null),
      getMealLogs(token, date).catch(() => []),
    ])
      .then(([workoutData, logs]) => {
        setWorkout(workoutData);
        setMealLogs(logs);
      })
      .finally(() => setLoadingDetail(false));
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return {
    month,
    year,
    todayDay,
    selectedDay,
    workout,
    mealLogs,
    workoutDays,
    nutritionDays,
    loadingDetail,
    firstDay,
    daysInMonth,
    changeMonth,
    handleDayClick,
  };
}
