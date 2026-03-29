import { useState, useRef, useEffect } from 'react';

function fmtHeight(totalInches, units) {
  if (units === 'Metric') return `${Math.round(totalInches * 2.54)} cm`;
  const ft = Math.floor(totalInches / 12);
  const inch = totalInches % 12;
  return `${ft}'${inch}"`;
}

export default function HeightStepper({ heightInches, units, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const inc = () => {
    if (units === 'Metric') {
      const cm = Math.round(heightInches * 2.54);
      onChange(Math.round((cm + 1) / 2.54));
    } else {
      onChange(heightInches + 1);
    }
  };

  const dec = () => {
    if (units === 'Metric') {
      const cm = Math.round(heightInches * 2.54);
      onChange(Math.max(12, Math.round((cm - 1) / 2.54)));
    } else {
      onChange(Math.max(12, heightInches - 1));
    }
  };

  const startEdit = () => {
    setDraft(
      units === 'Metric'
        ? String(Math.round(heightInches * 2.54))
        : fmtHeight(heightInches, 'Imperial')
    );
    setEditing(true);
  };

  const save = () => {
    const raw = draft.trim();
    let newInches = heightInches;
    if (units === 'Metric') {
      const cm = parseInt(raw, 10);
      if (!isNaN(cm) && cm > 0) newInches = Math.round(cm / 2.54);
    } else {
      const m = raw.match(/^(\d+)'(\d+)"?$/);
      if (m) {
        newInches = parseInt(m[1], 10) * 12 + parseInt(m[2], 10);
      } else {
        const n = parseInt(raw, 10);
        if (!isNaN(n) && n > 0) newInches = n;
      }
    }
    onChange(Math.max(12, newInches));
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div className="account-stat-cell">
      <div className="account-stat-label">Height</div>
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
            {fmtHeight(heightInches, units)}
          </span>
        )}
        <button className="account-step-btn" onClick={inc} aria-label="Increase">+</button>
      </div>
    </div>
  );
}
