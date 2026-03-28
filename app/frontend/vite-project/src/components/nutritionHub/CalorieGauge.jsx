const CIRCUMFERENCE = 2 * Math.PI * 62;

function CalorieGauge({ goal, onGoalChange, strokeDashOffset, circleStroke, remaining }) {
  return (
    <div className="sidebar-card">
      <div className="gauge-container">
        <svg width="140" height="140">
          <circle className="circle-bg" cx="70" cy="70" r="62" />
          <circle
            className="circle-progress"
            cx="70"
            cy="70"
            r="62"
            style={{
              strokeDasharray: `${CIRCUMFERENCE} ${CIRCUMFERENCE}`,
              strokeDashoffset: strokeDashOffset,
              stroke: circleStroke,
            }}
          />
        </svg>
        <div className="gauge-text">
          <h2>{Math.abs(remaining)}</h2>
          <p style={{ fontSize: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {remaining < 0 ? 'Exceeded' : 'Remaining'}
          </p>
        </div>
      </div>
      <div className="input-group" style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
        <label>Set Daily Goal (kcal)</label>
        <input
          type="number"
          value={goal}
          onChange={(e) => onGoalChange(parseInt(e.target.value) || 2000)}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}

export default CalorieGauge;
