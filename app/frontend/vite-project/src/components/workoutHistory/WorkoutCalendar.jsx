import { useState } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function WorkoutCalendar() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const changeMonth = (offset) => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + offset);
    setViewDate(d);
    setSelectedDay(null);
  };

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
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
          return (
            <div
              key={day}
              className={`calendar-day${selectedDay === day ? ' selected' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
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
          No workout recorded for this date.
        </div>
      </section>
    </div>
  );
}

export default WorkoutCalendar;
