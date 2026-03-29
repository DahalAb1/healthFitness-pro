import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/utils/timerSettings', () => ({
  getDefaultRest: vi.fn(() => 60),
  saveDefaultRest: vi.fn(),
}));

import RestTimer from '@/components/activeWorkout/RestTimer';
import { getDefaultRest, saveDefaultRest } from '@/utils/timerSettings';

describe('RestTimer', () => {
  let onDismiss;

  beforeEach(() => {
    onDismiss = vi.fn();
    vi.useFakeTimers();
    getDefaultRest.mockReturnValue(60);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders the "Rest Timer" label', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    expect(screen.getByText('Rest Timer')).toBeInTheDocument();
  });

  it('renders all four preset buttons', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    expect(screen.getByRole('button', { name: '30s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '60s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '90s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '120s' })).toBeInTheDocument();
  });

  it('renders the custom input and Set button', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    expect(screen.getByPlaceholderText('Custom (s)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set' })).toBeInTheDocument();
  });

  it('renders the Start Rest button initially', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    expect(screen.getByRole('button', { name: 'Start Rest' })).toBeInTheDocument();
  });

  it('renders the Skip button', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
  });

  it('renders the "Save as default" button initially', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    expect(screen.getByRole('button', { name: 'Save as default' })).toBeInTheDocument();
  });

  it('displays the default duration (60s) as 1:00 initially', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    expect(screen.getByText('1:00')).toBeInTheDocument();
  });

  it('reads the default rest from timerSettings on mount', () => {
    getDefaultRest.mockReturnValue(90);
    render(<RestTimer onDismiss={onDismiss} />);
    expect(screen.getByText('1:30')).toBeInTheDocument();
  });

  // ── Presets ────────────────────────────────────────────────────────────────

  it('starts the timer when a preset is clicked', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '30s' }));
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
  });

  it('updates the displayed time when a preset is selected', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '30s' }));
    expect(screen.getByText('0:30')).toBeInTheDocument();
  });

  it('marks the selected preset as active', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    const btn = screen.getByRole('button', { name: '90s' });
    fireEvent.click(btn);
    expect(btn.className).toContain('aw-timer-preset-active');
  });

  // ── Custom input ───────────────────────────────────────────────────────────

  it('starts the timer with a custom duration', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.change(screen.getByPlaceholderText('Custom (s)'), { target: { value: '45' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set' }));
    expect(screen.getByText('0:45')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
  });

  it('does not start when custom input is empty', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Set' }));
    expect(screen.queryByRole('button', { name: 'Stop' })).not.toBeInTheDocument();
  });

  it('does not start when custom input is zero', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.change(screen.getByPlaceholderText('Custom (s)'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set' }));
    expect(screen.queryByRole('button', { name: 'Stop' })).not.toBeInTheDocument();
  });

  it('clears the custom input after submission', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    const input = screen.getByPlaceholderText('Custom (s)');
    fireEvent.change(input, { target: { value: '45' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set' }));
    expect(input).toHaveValue(null);
  });

  // ── Running / Stop / Resume ────────────────────────────────────────────────

  it('shows Stop button while timer is running', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '60s' }));
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
  });

  it('shows Resume button after Stop is clicked', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '60s' }));
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
  });

  it('resumes the timer from where it was paused', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '60s' }));
    act(() => { vi.advanceTimersByTime(5000); });
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
  });

  it('counts down over time', async () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '30s' }));
    await act(async () => { vi.advanceTimersByTime(5000); });
    const text = screen.getByText(/^0:\d/).textContent;
    const secs = parseInt(text.split(':')[1], 10);
    expect(secs).toBeLessThan(30);
  });

  // ── Timer completion ───────────────────────────────────────────────────────

  it('shows "Rest complete!" when the timer reaches zero', async () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '30s' }));
    await act(async () => { vi.advanceTimersByTime(31000); });
    expect(screen.getByText('Rest complete!')).toBeInTheDocument();
  });

  it('shows "Restart" button after completion', async () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '30s' }));
    await act(async () => { vi.advanceTimersByTime(31000); });
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument();
  });

  it('displays 0:00 when the timer reaches zero', async () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '30s' }));
    await act(async () => { vi.advanceTimersByTime(31000); });
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('can restart after completion', async () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '30s' }));
    await act(async () => { vi.advanceTimersByTime(31000); });
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }));
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
  });

  // ── Skip ──────────────────────────────────────────────────────────────────

  it('calls onDismiss when Skip is clicked', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss even while the timer is running', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '60s' }));
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  // ── Save as default ────────────────────────────────────────────────────────

  it('calls saveDefaultRest with the current duration', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save as default' }));
    expect(saveDefaultRest).toHaveBeenCalledWith(60);
  });

  it('shows "Saved!" after saving the default', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save as default' }));
    expect(screen.getByRole('button', { name: 'Saved!' })).toBeInTheDocument();
  });

  it('saves the preset duration when a preset is selected and saved', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '90s' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save as default' }));
    expect(saveDefaultRest).toHaveBeenCalledWith(90);
  });

  it('resets "Saved!" label when a different preset is selected', () => {
    render(<RestTimer onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save as default' }));
    expect(screen.getByRole('button', { name: 'Saved!' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '30s' }));
    expect(screen.getByRole('button', { name: 'Save as default' })).toBeInTheDocument();
  });
});
