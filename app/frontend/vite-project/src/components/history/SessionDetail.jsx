import AsyncState from '../common/AsyncState';

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "misc"];

function NutritionSection({ mealLogs }) {
  if (!mealLogs || mealLogs.length === 0) return null;

  const grouped = Object.fromEntries(MEAL_TYPES.map((t) => [t, []]));
  mealLogs.forEach((log) => {
    if (grouped[log.meal_type]) grouped[log.meal_type].push(log);
  });
  const totalKcal = mealLogs.reduce((sum, l) => sum + l.kcal, 0);
  const totalProtein = mealLogs.reduce((sum, l) => sum + (l.protein_g ?? 0), 0);
  const totalCarbs = mealLogs.reduce((sum, l) => sum + (l.carbs_g ?? 0), 0);
  const totalFat = mealLogs.reduce((sum, l) => sum + (l.fat_g ?? 0), 0);

  return (
    <div className="day-detail-section">
      <div className="day-detail-section-header">
        <span>Nutrition</span>
        <span className="day-detail-macro-text">
          {Math.round(totalKcal)} Calories · Protein {Math.round(totalProtein)}g
          · Carbs {Math.round(totalCarbs)}g · Fat {Math.round(totalFat)}g
        </span>
      </div>
      {MEAL_TYPES.map((mealType) => {
        const items = grouped[mealType];
        if (items.length === 0) return null;
        const mealKcal = items.reduce((s, i) => s + i.kcal, 0);
        const mealProtein = items.reduce((s, i) => s + (i.protein_g ?? 0), 0);
        const mealCarbs = items.reduce((s, i) => s + (i.carbs_g ?? 0), 0);
        const mealFat = items.reduce((s, i) => s + (i.fat_g ?? 0), 0);
        return (
          <div key={mealType} className="day-detail-meal">
            <p className="workout-duration day-detail-meal-header">
              <span>
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </span>
              <span
                className="day-detail-macro-text"
                style={{ fontWeight: 700 }}
              >
                {Math.round(mealKcal)} Calories · Protein{" "}
                {Math.round(mealProtein)}g · Carbs {Math.round(mealCarbs)}g ·
                Fat {Math.round(mealFat)}g
              </span>
            </p>
            <table className="exercise-table nutrition-table">
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Kcal</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fat</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.food_name}</td>
                    <td>{Math.round(item.kcal)}</td>
                    <td>
                      {item.protein_g != null
                        ? `${Math.round(item.protein_g)}g`
                        : "—"}
                    </td>
                    <td>
                      {item.carbs_g != null
                        ? `${Math.round(item.carbs_g)}g`
                        : "—"}
                    </td>
                    <td>
                      {item.fat_g != null
                        ? `${Math.round(item.fat_g)}g`
                        : "—"}
                    </td>
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

function SessionDetail({
  month,
  year,
  selectedDay,
  loadingDetail,
  workout,
  mealLogs = [],
}) {
  const hasWorkout = !!workout;
  const hasNutrition = mealLogs.length > 0;

  return (
    <section className="selected-day">
      <h3 className="selected-date-header">
        {selectedDay
          ? `${MONTH_NAMES[month]} ${selectedDay}, ${year}`
          : "Select a date"}
      </h3>
      <div className="workout-details">
        {!selectedDay && (
          <p className="workout-placeholder">
            Click a day to view workout and nutrition details.
          </p>
        )}
        {selectedDay && (
          <AsyncState
            loading={loadingDetail}
            loadingText="Loading…"
            empty={!loadingDetail && !hasWorkout && !hasNutrition}
            emptyText="No workout or nutrition logged for this date."
            className="workout-placeholder"
          >
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
          </AsyncState>
        )}
      </div>
    </section>
  );
}

export default SessionDetail;
