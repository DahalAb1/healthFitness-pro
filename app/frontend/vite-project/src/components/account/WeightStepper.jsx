import { useState, useRef, useEffect } from 'react';

function fmtWeight(lbs, units) {
  if (units === 'Metric') return `${Math.round(lbs * 0.453592)} kg`;
  return `${lbs} lbs`;
}

export default function WeightStepper({ weightLbs, units, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const inc = () => {
    if (units === 'Metric') {
      const kg = Math.round(weightLbs * 0.453592);
      onChange(Math.round((kg + 1) / 0.453592));
    } else {
      onChange(weightLbs + 1);
    }
  };

  const dec = () => {
    if (units === 'Metric') {
      const kg = Math.round(weightLbs * 0.453592);
      onChange(Math.max(1, Math.round((kg - 1) / 0.453592)));
    } else {
      onChange(Math.max(1, weightLbs - 1));
    }
  };

  const startEdit = () => {
    setDraft(
      units === 'Metric'
        ? String(Math.round(weightLbs * 0.453592))
        : String(weightLbs)
    );
    setEditing(true);
  };

  const save = () => {
    const n = parseInt(draft.trim(), 10);
    if (!isNaN(n) && n > 0) {
      onChange(units === 'Metric' ? Math.round(n / 0.453592) : n);
    }
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div className="account-stat-cell">
      <div className="account-stat-label">Weight</div>
      <div className="account-stat-stepper">
        <button className="account-step-btn" onClick={dec} aria-label="Decrease">−</button>
        {editing ? (
          <input
            ref={inputRef}
            className="account-stat-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={handleKey}
          />
        ) : (
          <span
            className="account-stat-val account-stat-val--tap"
            onClick={startEdit}
            title="Tap to edit"
          >
            {fmtWeight(weightLbs, units)}
          </span>
        )}
        <button className="account-step-btn" onClick={inc} aria-label="Increase">+</button>
      </div>
    </div>
  );
}
