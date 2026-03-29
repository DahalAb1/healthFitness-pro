const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'misc'];

function NutritionSection({ mealLogs }) {
  if (!mealLogs || mealLogs.length === 0) return null;

  const grouped = Object.fromEntries(MEAL_TYPES.map(t => [t, []]));
  mealLogs.forEach(log => { if (grouped[log.meal_type]) grouped[log.meal_type].push(log); });
  const totalKcal = mealLogs.reduce((sum, l) => sum + l.kcal, 0);

  return (
    <div className="day-detail-section">
      <div className="day-detail-section-header">
        <span>Nutrition</span>
        <span className="day-detail-section-total">{Math.round(totalKcal)} kcal total</span>
      </div>
      {MEAL_TYPES.map(mealType => {
        const items = grouped[mealType];
        if (items.length === 0) return null;
        const mealKcal = items.reduce((s, i) => s + i.kcal, 0);
        return (
          <div key={mealType} className="day-detail-meal">
            <p className="workout-duration">
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </p>
            <table className="exercise-table">
              <thead>
                <tr>
                  <th>Food</th>
                  <th style={{ textAlign: 'right' }}>Kcal</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.food_name}</td>
                    <td style={{ textAlign: 'right' }}>{Math.round(item.kcal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

function SessionDetail({ month, year, selectedDay, loadingDetail, workout, mealLogs = [] }) {
  const hasWorkout = !!workout;
  const hasNutrition = mealLogs.length > 0;

  return (
    <section className="selected-day">
      <h3 className="selected-date-header">
        {selectedDay
          ? `${MONTH_NAMES[month]} ${selectedDay}, ${year}`
          : 'Select a date'}
      </h3>
      <div className="workout-details">
        {!selectedDay && (
          <p className="workout-placeholder">Click a day to view workout and nutrition details.</p>
        )}
        {selectedDay && loadingDetail && <p className="workout-placeholder">Loading…</p>}
        {selectedDay && !loadingDetail && !hasWorkout && !hasNutrition && (
          <p className="workout-placeholder">No workout or nutrition logged for this date.</p>
        )}
        {selectedDay && !loadingDetail && (
          <>
            {hasWorkout && (
              <div className="day-detail-section">
                <div className="day-detail-section-header">
                  <span>Workout</span>
                  <span className="day-detail-section-total">{workout.duration_minutes} min</span>
                </div>
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
              </div>
            )}
            <NutritionSection mealLogs={mealLogs} />
          </>
        )}
      </div>
    </section>
  );
}

export default SessionDetail;
