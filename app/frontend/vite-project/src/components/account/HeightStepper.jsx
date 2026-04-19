import { useState } from 'react';
import NumericStepper from '../common/NumericStepper';

function fmtHeight(totalInches, units) {
  if (units === 'Metric') return `${Math.round(totalInches * 2.54)} cm`;
  const rounded = Math.round(totalInches);
  const ft = Math.floor(rounded / 12);
  const inch = rounded % 12;
  return `${ft}'${inch}"`;
}

export default function HeightStepper({ heightInches, units, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const inc = () => {
    if (units === 'Metric') {
      onChange(heightInches + 1 / 2.54);
    } else {
      onChange(Math.round(heightInches) + 1);
    }
  };

  const dec = () => {
    if (units === 'Metric') {
      onChange(Math.max(12, heightInches - 1 / 2.54));
    } else {
      onChange(Math.max(12, Math.round(heightInches) - 1));
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
    <NumericStepper
      label="Height"
      displayValue={fmtHeight(heightInches, units)}
      onIncrement={inc}
      onDecrement={dec}
      isEditing={editing}
      editingValue={draft}
      onStartEdit={startEdit}
      onChange={(e) => setDraft(e.target.value)}
      onSave={save}
      onKey={handleKey}
    />
  );
}
