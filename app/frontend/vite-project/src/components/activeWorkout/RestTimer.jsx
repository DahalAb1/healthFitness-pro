import { useState, useEffect, useRef } from 'react';

const PRESETS = [30, 60, 120];
const DEFAULT_DURATION = 60;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function RestTimer({ onDismiss }) {
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) setRunning(false);
  }, [timeLeft]);

  function selectPreset(secs) {
    setDuration(secs);
    setTimeLeft(secs);
    setRunning(true);
  }

  function togglePause() {
    if (timeLeft === 0) return;
    setRunning((r) => !r);
  }

  function reset() {
    setTimeLeft(duration);
    setRunning(true);
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const progress = timeLeft / duration;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

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
        <span className="aw-timer-count">{mins}:{secs}</span>
      </div>

      <div className="aw-timer-actions">
        <button className="aw-timer-btn" onClick={togglePause}>
          {running ? 'Pause' : timeLeft === 0 ? 'Done' : 'Resume'}
        </button>
        <button className="aw-timer-btn" onClick={reset}>Reset</button>
        <button className="aw-timer-btn aw-timer-btn-skip" onClick={onDismiss}>Skip</button>
      </div>
    </div>
  );
}

export default RestTimer;
