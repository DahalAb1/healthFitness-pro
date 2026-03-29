import { useState, useEffect } from 'react';
import { getWorkoutByDate, getWorkouts } from '../utils/api';
import { useAuth } from '../context/useAuth';

const TODAY = new Date();

export function useWorkoutCalendar() {
  const { token } = useAuth();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [workoutDays, setWorkoutDays] = useState(new Set());
  const [loadingDetail, setLoadingDetail] = useState(false);

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();

  const isCurrentMonth = year === TODAY.getFullYear() && month === TODAY.getMonth();
  const todayDay = isCurrentMonth ? TODAY.getDate() : null;

  useEffect(() => {
    if (!token) return;
    getWorkouts(token)
      .then((sessions) => {
        const days = new Set();
        sessions.forEach((s) => {
          const [y, m, d] = s.workout_date.split('-').map(Number);
          if (y === year && m === month + 1) days.add(d);
        });
        setWorkoutDays(days);
      })
      .catch(() => {});
  }, [year, month, token]);

  function changeMonth(offset) {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + offset);
    setViewDate(d);
    setSelectedDay(null);
    setWorkout(null);
  }

  function handleDayClick(day) {
    setSelectedDay(day);
    setWorkout(null);
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setLoadingDetail(true);
    getWorkoutByDate(token, date)
      .then((data) => setWorkout(data))
      .catch(() => setWorkout(null))
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
    workoutDays,
    loadingDetail,
    firstDay,
    daysInMonth,
    changeMonth,
    handleDayClick,
  };
}
