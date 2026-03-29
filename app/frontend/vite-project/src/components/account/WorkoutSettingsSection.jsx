import { useState } from 'react';
import { getDefaultRest, saveDefaultRest } from '../../utils/timerSettings';

const PRESETS = [30, 60, 90, 120];

export default function WorkoutSettingsSection() {
  const [selected, setSelected] = useState(getDefaultRest);
  const [saved, setSaved] = useState(false);

  function handleSelect(secs) {
    setSelected(secs);
    setSaved(false);
  }

  function handleSave() {
    saveDefaultRest(selected);
    setSaved(true);
  }

  return (
    <div className="account-section">
      <span className="account-section-label">Workout Settings</span>
      <div className="account-menu" style={{ padding: '12px 16px', gap: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span className="account-mi-label">Default rest timer duration</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          {PRESETS.map((s) => (
            <button
              key={s}
              className={`account-seg-btn${selected === s ? ' account-seg-btn--active' : ''}`}
              onClick={() => handleSelect(s)}
            >
              {s}s
            </button>
          ))}
          <button className="account-edit-btn account-edit-btn--save" onClick={handleSave} style={{ marginLeft: 'auto' }}>
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
