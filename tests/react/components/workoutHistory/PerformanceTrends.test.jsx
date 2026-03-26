import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock chart.js and react-chartjs-2 since jsdom has no canvas
vi.mock('react-chartjs-2', () => ({
  Line: () => <canvas data-testid="line-chart" />,
}));
vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: class {},
  LinearScale: class {},
  PointElement: class {},
  LineElement: class {},
  Filler: class {},
  Tooltip: class {},
  Legend: class {},
}));

vi.mock('@/utils/api', () => ({
  getProgressWeights: vi.fn(),
}));

import PerformanceTrends from '@/components/workoutHistory/PerformanceTrends';
import { getProgressWeights } from '@/utils/api';

function renderComponent() {
  return render(<PerformanceTrends />);
}

describe('PerformanceTrends', () => {
  beforeEach(() => {
    getProgressWeights.mockReset();
  });

  it('renders the section heading', () => {
    renderComponent();
    expect(screen.getByText('Performance Trends')).toBeInTheDocument();
  });

  it('shows empty prompt before any exercise is searched', () => {
    renderComponent();
    expect(
      screen.getByText('Enter an exercise name above to view your progress.'),
    ).toBeInTheDocument();
  });

  it('renders the search input and Load button', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/exercise name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Load' })).toBeInTheDocument();
  });

  it('renders time-range filter buttons', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: '7 Days' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30 Days' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All Time' })).toBeInTheDocument();
  });

  it('calls getProgressWeights when form is submitted', async () => {
    getProgressWeights.mockResolvedValue({ points: [], first_weight: 0, last_weight: 0, change: 0 });
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/exercise name/i), {
      target: { value: 'Bench Press' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load' }));
    await waitFor(() => expect(getProgressWeights).toHaveBeenCalledWith(1, 'Bench Press'));
  });

  it('does not call the API when the input is blank', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Load' }));
    expect(getProgressWeights).not.toHaveBeenCalled();
  });

  it('shows "Loading…" state while the API is in flight', async () => {
    getProgressWeights.mockImplementation(() => new Promise(() => {}));
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/exercise name/i), {
      target: { value: 'Squat' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load' }));
    await waitFor(() => expect(screen.getByText('Loading…')).toBeInTheDocument());
  });

  it('shows error message when the API rejects', async () => {
    getProgressWeights.mockRejectedValue(new Error('not found'));
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/exercise name/i), {
      target: { value: 'Fake Exercise' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load' }));
    await waitFor(() =>
      expect(
        screen.getByText('No progress data found for this exercise.'),
      ).toBeInTheDocument(),
    );
  });

  it('renders the chart area (no error/empty message) when data points are returned', async () => {
    getProgressWeights.mockResolvedValue({
      points: [{ date: '2024-01-01', weight: 135 }],
      first_weight: 135,
      last_weight: 135,
      change: 0,
      percent_change: 0,
    });
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/exercise name/i), {
      target: { value: 'Bench Press' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load' }));
    await waitFor(() =>
      expect(screen.queryByText('No progress data found for this exercise.')).not.toBeInTheDocument(),
    );
    expect(screen.queryByText('No data in this time range.')).not.toBeInTheDocument();
    expect(screen.queryByText('Enter an exercise name above to view your progress.')).not.toBeInTheDocument();
  });

  it('shows "No data in this time range" when filtered points are empty', async () => {
    // Return a point far in the past so it falls outside the 7-day filter
    getProgressWeights.mockResolvedValue({
      points: [{ date: '2000-01-01', weight: 100 }],
      first_weight: 100,
      last_weight: 100,
      change: 0,
      percent_change: 0,
    });
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/exercise name/i), {
      target: { value: 'Bench Press' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load' }));
    // Wait for the data to load (All Time shows the data point)
    await waitFor(() =>
      expect(screen.queryByText('No data in this time range.')).not.toBeInTheDocument(),
    );
    // Switch to 7-day filter — the 2000 date is outside the 7-day window
    fireEvent.click(screen.getByRole('button', { name: '7 Days' }));
    expect(screen.getByText('No data in this time range.')).toBeInTheDocument();
  });

  it('displays stats (first/latest weight) after a successful search', async () => {
    getProgressWeights.mockResolvedValue({
      points: [{ date: '2024-01-01', weight: 135 }],
      first_weight: 100,
      last_weight: 135,
      change: 35,
      percent_change: 35,
    });
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/exercise name/i), {
      target: { value: 'Bench Press' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load' }));
    await waitFor(() => expect(screen.getByText('100 lbs')).toBeInTheDocument());
    expect(screen.getByText('135 lbs')).toBeInTheDocument();
  });
});
