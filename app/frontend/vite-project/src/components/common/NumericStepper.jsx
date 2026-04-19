function NumericStepper({ label, displayValue, onIncrement, onDecrement, editingValue, isEditing, onStartEdit, onChange, onSave, onKey }) {
  return (
    <div className="account-stat-cell">
      <div className="account-stat-label">{label}</div>
      <div className="account-stat-stepper">
        <button className="account-step-btn" onClick={onDecrement} aria-label="Decrease">−</button>
        {isEditing ? (
          <input
            className="account-stat-input"
            value={editingValue}
            onChange={onChange}
            onBlur={onSave}
            onKeyDown={onKey}
            autoFocus
          />
        ) : (
          <span
            className="account-stat-val account-stat-val--tap"
            onClick={onStartEdit}
            title="Tap to edit"
          >
            {displayValue}
          </span>
        )}
        <button className="account-step-btn" onClick={onIncrement} aria-label="Increase">+</button>
      </div>
    </div>
  );
}

export default NumericStepper;
