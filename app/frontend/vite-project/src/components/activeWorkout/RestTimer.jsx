import { useState } from 'react';
import { useRestTimer } from './useRestTimer';
import { getDefaultRest } from '../../utils/timerSettings';

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
  const { remaining, isRunning, isDone, start, stop } = useRestTimer(onDismiss);

  const timeLeft = remaining !== null ? remaining : duration;
  const progress = duration > 0 ? timeLeft / duration : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  function selectPreset(secs) {
    setDuration(secs);
    start(secs);
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
        ) : (
          <button className="aw-btn aw-btn-timer-start" onClick={() => start(duration)}>
            {isDone ? 'Restart' : 'Start Rest'}
          </button>
        )}
        <button className="aw-timer-btn aw-timer-btn-skip" onClick={onDismiss}>Skip</button>
      </div>
    </div>
  );
}

export default RestTimer;
