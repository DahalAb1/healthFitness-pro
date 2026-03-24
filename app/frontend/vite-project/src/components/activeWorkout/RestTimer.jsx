import { useState } from 'react';
import { useRestTimer } from './useRestTimer';

const PRESETS = [30, 60, 90, 120];

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function RestTimer({ defaultSeconds = 60, onComplete }) {
  const [duration, setDuration] = useState(defaultSeconds);
  const { remaining, isRunning, isDone, start, stop } = useRestTimer(onComplete);

  const display = remaining !== null ? formatTime(remaining) : formatTime(duration);

  return (
    <div className="aw-timer">
      <p className="aw-timer-label">Rest Timer</p>
      <div className={`aw-timer-display${isDone ? ' aw-timer-display--done' : ''}`}>
        {display}
      </div>
      {isDone && <p className="aw-timer-done-msg">Rest complete!</p>}
      <div className="aw-timer-presets">
        {PRESETS.map((s) => (
          <button
            key={s}
            className={`aw-timer-preset${duration === s && !isRunning ? ' active' : ''}`}
            onClick={() => {
              setDuration(s);
              if (!isRunning) stop();
            }}
          >
            {s}s
          </button>
        ))}
      </div>
      <div className="aw-timer-controls">
        {isRunning ? (
          <button className="aw-btn aw-btn-timer-stop" onClick={stop}>
            Stop
          </button>
        ) : (
          <button className="aw-btn aw-btn-timer-start" onClick={() => start(duration)}>
            {isDone ? 'Restart' : 'Start Rest'}
          </button>
        )}
      </div>
    </div>
  );
}
