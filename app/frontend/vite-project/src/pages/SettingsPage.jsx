import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { getDefaultRest, saveDefaultRest } from '../utils/timerSettings';
import '../styles/components/settings.css';

const PRESETS = [30, 60, 90, 120];

function SettingsPage() {
  const [selected, setSelected] = useState(getDefaultRest);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveDefaultRest(selected);
    setSaved(true);
  }

  function handleSelect(secs) {
    setSelected(secs);
    setSaved(false);
  }

  return (
    <>
      <Navbar />
      <div className="settings-page">
        <h1 className="settings-title">Settings</h1>

        <section className="settings-section">
          <h2 className="settings-section-title">Default Rest Period</h2>
          <p className="settings-section-desc">
            Choose how long the rest timer runs by default after completing a set.
          </p>
          <div className="settings-presets">
            {PRESETS.map((s) => (
              <button
                key={s}
                className={`settings-preset${selected === s ? ' settings-preset-active' : ''}`}
                onClick={() => handleSelect(s)}
              >
                {s}s
              </button>
            ))}
          </div>
          <button className="settings-save-btn" onClick={handleSave}>
            {saved ? 'Saved!' : 'Save'}
          </button>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default SettingsPage;
