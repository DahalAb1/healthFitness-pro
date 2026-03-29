const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function WorkoutSessionDetail({ month, year, selectedDay, loadingDetail, workout }) {
  return (
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
  );
}

export default WorkoutSessionDetail;
