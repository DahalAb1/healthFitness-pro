import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/utils/api', () => ({
  getWorkouts: vi.fn(),
  getWorkoutByDate: vi.fn(),
  getMealLogs: vi.fn(),
  getNutritionActiveDates: vi.fn(),
}));

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

import Calendar from '@/components/history/Calendar';
import { getWorkouts, getWorkoutByDate, getMealLogs, getNutritionActiveDates } from '@/utils/api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function renderCalendar() {
  return render(<Calendar />);
}

describe('Calendar', () => {
  beforeEach(() => {
    getWorkouts.mockResolvedValue([]);
    getWorkoutByDate.mockResolvedValue(null);
    getMealLogs.mockResolvedValue([]);
    getNutritionActiveDates.mockResolvedValue({ days: [] });
  });

  it('renders the current month and year heading', async () => {
    renderCalendar();
    const now = new Date();
    const heading = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    await waitFor(() => expect(screen.getByText(heading)).toBeInTheDocument());
  });

  it('renders day-of-week headers', () => {
    renderCalendar();
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((day) =>
      expect(screen.getByText(day)).toBeInTheDocument(),
    );
  });

  it('navigates to the previous month', async () => {
    renderCalendar();
    const now = new Date();
    const curr = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const heading = `${MONTH_NAMES[prev.getMonth()]} ${prev.getFullYear()}`;
    await waitFor(() => expect(screen.getByText(curr)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: '<' }));
    await waitFor(() => expect(screen.getByText(heading)).toBeInTheDocument());
  });

  it('navigates to the next month', async () => {
    renderCalendar();
    const now = new Date();
    const curr = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const heading = `${MONTH_NAMES[next.getMonth()]} ${next.getFullYear()}`;
    await waitFor(() => expect(screen.getByText(curr)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: '>' }));
    await waitFor(() => expect(screen.getByText(heading)).toBeInTheDocument());
  });

  it('shows placeholder text before a day is selected', () => {
    renderCalendar();
    expect(screen.getByText('Click a day to view workout and nutrition details.')).toBeInTheDocument();
  });

  it('shows "Select a date" heading before any day is clicked', () => {
    renderCalendar();
    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });

  it('shows loading state after a day is clicked', async () => {
    // Make it hang so we can see the loading state
    getWorkoutByDate.mockImplementation(() => new Promise(() => {}));
    renderCalendar();
    fireEvent.click(screen.getAllByText('1')[0]);
    await waitFor(() => expect(screen.getByText('Loading…')).toBeInTheDocument());
  });

  it('shows "No workout recorded" when API returns null', async () => {
    getWorkoutByDate.mockResolvedValue(null);
    renderCalendar();
    fireEvent.click(screen.getAllByText('1')[0]);
    await waitFor(() =>
      expect(screen.getByText('No workout or nutrition logged for this date.')).toBeInTheDocument(),
    );
  });

  it('shows workout details when API returns a workout', async () => {
    getWorkoutByDate.mockResolvedValue({
      duration_minutes: 45,
      exercises: [{ exercise_name: 'Squat', sets: 3, reps: 10, weight: 135 }],
    });
    renderCalendar();
    fireEvent.click(screen.getAllByText('1')[0]);
    await waitFor(() => expect(screen.getByText('45 min')).toBeInTheDocument());
    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.getByText('135 lbs')).toBeInTheDocument();
  });

  it('marks days that have workouts', async () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-05`;
    getWorkouts.mockResolvedValue([{ workout_date: dateStr }]);
    const { container } = renderCalendar();
    await waitFor(() => {
      const days = container.querySelectorAll('.calendar-day.has-workout');
      expect(days.length).toBeGreaterThan(0);
    });
  });

  it('resets selection when navigating months', async () => {
    getWorkoutByDate.mockResolvedValue({ duration_minutes: 30, exercises: [] });
    renderCalendar();
    fireEvent.click(screen.getAllByText('1')[0]);
    await waitFor(() => expect(screen.queryByText('Select a date')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: '<' }));
    await waitFor(() => expect(screen.getByText('Select a date')).toBeInTheDocument());
  });
});
