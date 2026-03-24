import { useState, useEffect } from 'react';
import { getWorkoutByDate, getWorkouts } from '../../utils/api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TODAY = new Date();

function WorkoutCalendar() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [workoutDays, setWorkoutDays] = useState(new Set());
  const [loadingDetail, setLoadingDetail] = useState(false);

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();

  const isCurrentMonth = year === TODAY.getFullYear() && month === TODAY.getMonth();
  const todayDay = isCurrentMonth ? TODAY.getDate() : null;

  // Pre-load which days in this month have workouts
  useEffect(() => {
    getWorkouts(1)
      .then((sessions) => {
        const days = new Set();
        sessions.forEach((s) => {
          const [y, m, d] = s.workout_date.split('-').map(Number);
          if (y === year && m === month + 1) days.add(d);
        });
        setWorkoutDays(days);
      })
      .catch(() => {});
  }, [year, month]);

  const changeMonth = (offset) => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + offset);
    setViewDate(d);
    setSelectedDay(null);
    setWorkout(null);
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setWorkout(null);
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setLoadingDetail(true);
    getWorkoutByDate(1, date)
      .then((data) => setWorkout(data))
      .catch(() => setWorkout(null))
      .finally(() => setLoadingDetail(false));
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="calendar-page">
      <div className="month-nav">
        <button onClick={() => changeMonth(-1)}>&lt;</button>
        <h2>{MONTH_NAMES[month]} {year}</h2>
        <button onClick={() => changeMonth(1)}>&gt;</button>
      </div>

      <div className="month-grid">
        {DAY_LABELS.map((d) => (
          <div key={d} className="day-header">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const classes = [
            'calendar-day',
            selectedDay === day ? 'selected' : '',
            todayDay === day ? 'today' : '',
            workoutDays.has(day) ? 'has-workout' : '',
          ].filter(Boolean).join(' ');
          return (
            <div key={day} className={classes} onClick={() => handleDayClick(day)}>
              {day}
            </div>
          );
        })}
      </div>

      <section className="selected-day">
        <h3 className="selected-date-header">
          {selectedDay
            ? `${MONTH_NAMES[month]} ${selectedDay}, ${year}`
            : 'Select a date'}
        </h3>
        <div className="workout-details">
          {!selectedDay && (
            <p className="workout-placeholder">Click a day to view workout details.</p>
          )}
          {selectedDay && loadingDetail && <p className="workout-placeholder">Loading…</p>}
          {selectedDay && !loadingDetail && !workout && (
            <p className="workout-placeholder">No workout recorded for this date.</p>
          )}
          {selectedDay && !loadingDetail && workout && (
            <>
              <p className="workout-duration">Duration: {workout.duration_minutes} min</p>
              {workout.exercises && workout.exercises.length > 0 ? (
                <table className="exercise-table">
                  <thead>
                    <tr>
                      <th>Exercise</th>
                      <th>Sets</th>
                      <th>Reps</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workout.exercises.map((ex, idx) => (
                      <tr key={idx}>
                        <td>{ex.exercise_name}</td>
                        <td>{ex.sets}</td>
                        <td>{ex.reps}</td>
                        <td>{ex.weight} lbs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="workout-placeholder">No exercises logged for this session.</p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default WorkoutCalendar;
