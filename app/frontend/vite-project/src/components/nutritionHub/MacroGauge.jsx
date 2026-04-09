const CIRCUMFERENCE = 2 * Math.PI * 54;

/**
 * Reusable circular gauge for a single macronutrient.
 * Props:
 *   label        — display name, e.g. "Protein"
 *   unit         — unit string, e.g. "g"
 *   total        — current consumed amount
 *   goal         — daily target
 *   onGoalChange — setter called with the new numeric goal
 *   accentColor  — CSS color string for the progress arc and label
 */
function MacroGauge({ label, unit = 'g', total, goal, onGoalChange, accentColor }) {
  const remaining = goal - total;
  const pct = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;
  const strokeDashOffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
  const isOver = total > goal;
  const arcColor = isOver ? 'var(--danger)' : accentColor;

  return (
    <div className="macro-gauge-card">
      <div className="macro-gauge-label" style={{ color: accentColor }}>
        {label}
      </div>
      <div className="macro-gauge-container">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            className="macro-circle-bg"
            cx="60" cy="60" r="54"
          />
          <circle
            className="macro-circle-progress"
            cx="60" cy="60" r="54"
            style={{
              strokeDasharray: `${CIRCUMFERENCE} ${CIRCUMFERENCE}`,
              strokeDashoffset: strokeDashOffset,
              stroke: arcColor,
            }}
          />
        </svg>
        <div className="macro-gauge-text">
          <span className="macro-gauge-value">{Math.round(Math.abs(remaining))}{unit}</span>
          <span className="macro-gauge-sub">{isOver ? 'over' : 'left'}</span>
        </div>
      </div>
      <div className="macro-gauge-consumed">
        {Math.round(total)}{unit} / {goal}{unit}
      </div>
      <div className="macro-gauge-input-row">
        <label style={{ color: accentColor }}>Goal ({unit})</label>
        <input
          type="number"
          value={goal}
          onChange={(e) => onGoalChange(parseInt(e.target.value) || 1)}
        />
      </div>
    </div>
  );
}

export default MacroGauge;
