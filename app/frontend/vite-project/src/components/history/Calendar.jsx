import { useCalendar } from '../../hooks/useCalendar';
import SessionDetail from './SessionDetail';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Calendar() {
  const {
    month, year, todayDay,
    selectedDay, workout, mealLogs, workoutDays, nutritionDays, loadingDetail,
    firstDay, daysInMonth,
    changeMonth, handleDayClick,
  } = useCalendar();

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
            nutritionDays.has(day) ? 'has-nutrition' : '',
          ].filter(Boolean).join(' ');
          return (
            <div key={day} className={classes} onClick={() => handleDayClick(day)}>
              {day}
            </div>
          );
        })}
      </div>

      <SessionDetail
        month={month}
        year={year}
        selectedDay={selectedDay}
        loadingDetail={loadingDetail}
        workout={workout}
        mealLogs={mealLogs}
      />
    </div>
  );
}

export default Calendar;
