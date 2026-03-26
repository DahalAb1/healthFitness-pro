import { useState, useEffect, useRef, useCallback } from 'react';

export function useRestTimer(onComplete) {
  const [remaining, setRemaining] = useState(null); // null = idle
  const endTimeRef = useRef(null);
  const intervalRef = useRef(null);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    endTimeRef.current = null;
    setRemaining(null);
  }, []);

  const start = useCallback(
    (seconds) => {
      stop();
      endTimeRef.current = Date.now() + seconds * 1000;
      setRemaining(seconds);

      intervalRef.current = setInterval(() => {
        const left = Math.round((endTimeRef.current - Date.now()) / 1000);
        if (left <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          endTimeRef.current = null;
          setRemaining(0);
          onComplete?.();
        } else {
          setRemaining(left);
        }
      }, 500);
    },
    [stop, onComplete]
  );

  // Re-sync when user returns to the tab
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && endTimeRef.current) {
        const left = Math.round((endTimeRef.current - Date.now()) / 1000);
        if (left <= 0) {
          stop();
          setRemaining(0);
          onComplete?.();
        } else {
          setRemaining(left);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [stop, onComplete]);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { remaining, isRunning: remaining !== null && remaining > 0, isDone: remaining === 0, start, stop };
}
