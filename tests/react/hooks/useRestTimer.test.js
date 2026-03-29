import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRestTimer } from '@/hooks/useRestTimer';

describe('useRestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initialises with remaining=null, isRunning=false, isPaused=false, isDone=false', () => {
    const { result } = renderHook(() => useRestTimer());
    expect(result.current.remaining).toBeNull();
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isDone).toBe(false);
  });

  it('start sets isRunning=true and remaining to the given seconds', () => {
    const { result } = renderHook(() => useRestTimer());
    act(() => { result.current.start(30); });
    expect(result.current.isRunning).toBe(true);
    expect(result.current.remaining).toBe(30);
  });

  it('remaining decreases as the interval fires', () => {
    const { result } = renderHook(() => useRestTimer());
    act(() => { result.current.start(10); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.remaining).toBeLessThanOrEqual(10);
    expect(result.current.remaining).toBeGreaterThan(0);
  });

  it('calls onComplete and sets isDone=true when timer reaches zero', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useRestTimer(onComplete));
    act(() => { result.current.start(5); });
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.isDone).toBe(true);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.remaining).toBe(0);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not throw when started without an onComplete callback', () => {
    const { result } = renderHook(() => useRestTimer());
    act(() => { result.current.start(5); });
    expect(() => act(() => { vi.advanceTimersByTime(5000); })).not.toThrow();
    expect(result.current.isDone).toBe(true);
  });

  it('stop sets isRunning=false while preserving remaining', () => {
    const { result } = renderHook(() => useRestTimer());
    act(() => { result.current.start(30); });
    act(() => { vi.advanceTimersByTime(1000); });
    const remainingBeforeStop = result.current.remaining;
    act(() => { result.current.stop(); });
    expect(result.current.isRunning).toBe(false);
    expect(result.current.remaining).toBe(remainingBeforeStop);
  });

  it('isPaused is true after stop when remaining > 0', () => {
    const { result } = renderHook(() => useRestTimer());
    act(() => { result.current.start(30); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { result.current.stop(); });
    expect(result.current.isPaused).toBe(true);
  });

  it('isPaused is false when isRunning=true', () => {
    const { result } = renderHook(() => useRestTimer());
    act(() => { result.current.start(30); });
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });

  it('isDone is false while timer is running', () => {
    const { result } = renderHook(() => useRestTimer());
    act(() => { result.current.start(10); });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.isDone).toBe(false);
    expect(result.current.isRunning).toBe(true);
  });

  it('restarting replaces remaining and resets state', () => {
    const { result } = renderHook(() => useRestTimer());
    act(() => { result.current.start(5); });
    act(() => { vi.advanceTimersByTime(2000); });
    // Restart with a new duration
    act(() => { result.current.start(20); });
    expect(result.current.remaining).toBe(20);
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isDone).toBe(false);
  });

  it('stop is a no-op when timer was never started', () => {
    const { result } = renderHook(() => useRestTimer());
    expect(() => act(() => { result.current.stop(); })).not.toThrow();
    expect(result.current.remaining).toBeNull();
    expect(result.current.isRunning).toBe(false);
  });
});
