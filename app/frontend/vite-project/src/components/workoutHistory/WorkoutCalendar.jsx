import { useWorkoutCalendar } from '../../hooks/useWorkoutCalendar';
import WorkoutSessionDetail from './WorkoutSessionDetail';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function WorkoutCalendar() {
  const {
    month, year, todayDay,
    selectedDay, workout, workoutDays, loadingDetail,
    firstDay, daysInMonth,
    changeMonth, handleDayClick,
  } = useWorkoutCalendar();

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

      <WorkoutSessionDetail
        month={month}
        year={year}
        selectedDay={selectedDay}
        loadingDetail={loadingDetail}
        workout={workout}
      />
    </div>
  );
}

export default WorkoutCalendar;
