import { useState } from 'react';
import { useRestTimer } from '../../hooks/useRestTimer';
import { getDefaultRest, saveDefaultRest } from '../../utils/timerSettings';

const PRESETS = [30, 60, 90, 120];
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function RestTimer({ onDismiss }) {
  const [duration, setDuration] = useState(getDefaultRest);
  const [saved, setSaved] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const { remaining, isRunning, isPaused, isDone, start, stop } = useRestTimer(onDismiss);

  const timeLeft = remaining !== null ? remaining : duration;
  const progress = duration > 0 ? timeLeft / duration : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  function selectPreset(secs) {
    setDuration(secs);
    setSaved(false);
    start(secs);
  }

  function handleCustomSubmit(e) {
    e.preventDefault();
    const secs = parseInt(customInput, 10);
    if (secs > 0) {
      selectPreset(secs);
      setCustomInput('');
    }
  }

  function handleSaveDefault() {
    saveDefaultRest(duration);
    setSaved(true);
  }

  return (
    <div className="aw-timer">
      <p className="aw-timer-label">Rest Timer</p>

      <div className="aw-timer-presets">
        {PRESETS.map((s) => (
          <button
            key={s}
            className={`aw-timer-preset${duration === s ? ' aw-timer-preset-active' : ''}`}
            onClick={() => selectPreset(s)}
          >
            {s}s
          </button>
        ))}
      </div>

      <form className="aw-timer-custom" onSubmit={handleCustomSubmit}>
        <input
          type="number"
          min="1"
          className="aw-timer-custom-input"
          placeholder="Custom (s)"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
        />
        <button type="submit" className="aw-timer-custom-btn">Set</button>
      </form>

      <div className="aw-timer-ring-wrap">
        <svg className="aw-timer-svg" viewBox="0 0 120 120">
          <circle className="aw-timer-track" cx="60" cy="60" r={RADIUS} />
          <circle
            className="aw-timer-progress"
            cx="60"
            cy="60"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className={`aw-timer-count${isDone ? ' aw-timer-count--done' : ''}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      {isDone && <p className="aw-timer-done-msg">Rest complete!</p>}

      <div className="aw-timer-controls">
        {isRunning ? (
          <button className="aw-btn aw-btn-timer-stop" onClick={stop}>Stop</button>
        ) : isPaused ? (
          <button className="aw-btn aw-btn-timer-start" onClick={() => start(remaining)}>Resume</button>
        ) : (
          <button className="aw-btn aw-btn-timer-start" onClick={() => start(duration)}>
            {isDone ? 'Restart' : 'Start Rest'}
          </button>
        )}
        <button className="aw-timer-btn aw-timer-btn-skip" onClick={onDismiss}>Skip</button>
        <button className="aw-timer-btn aw-timer-btn-save" onClick={handleSaveDefault}>
          {saved ? 'Saved!' : 'Save as default'}
        </button>
      </div>
    </div>
  );
}

export default RestTimer;
