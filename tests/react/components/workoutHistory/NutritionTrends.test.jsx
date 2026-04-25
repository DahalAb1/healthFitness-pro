import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock chart dependencies (jsdom has no canvas)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Mock the useNutritionTrends hook so the component is tested in isolation
// ---------------------------------------------------------------------------
const mockSetFilter = vi.fn();
const mockSetActiveMacro = vi.fn();

const DEFAULT_HOOK_STATE = {
  filter: 'month',
  setFilter: mockSetFilter,
  activeMacro: 'kcal',
  setActiveMacro: mockSetActiveMacro,
  filteredPoints: [],
  chartData: { labels: [], datasets: [{ label: 'Calories (kcal)', data: [] }] },
  summaryStats: null,
  loading: false,
  error: null,
};

let hookState = { ...DEFAULT_HOOK_STATE };

vi.mock('@/hooks/useNutritionTrends', () => ({
  useNutritionTrends: () => hookState,
  MACRO_KEYS: ['kcal', 'protein', 'carbs', 'fat'],
}));

import NutritionTrends from '@/components/history/NutritionTrends';

describe('NutritionTrends component', () => {
  beforeEach(() => {
    hookState = { ...DEFAULT_HOOK_STATE };
    mockSetFilter.mockReset();
    mockSetActiveMacro.mockReset();
  });

  it('renders the "Nutrition Trends" heading', () => {
    render(<NutritionTrends />);
    expect(screen.getByText('Nutrition Trends')).toBeInTheDocument();
  });

  it('renders time-range filter buttons', () => {
    render(<NutritionTrends />);
    expect(screen.getByRole('button', { name: '7 Days' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30 Days' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All Time' })).toBeInTheDocument();
  });

  it('renders macro toggle buttons for all four macros', () => {
    render(<NutritionTrends />);
    expect(screen.getByRole('button', { name: /calories/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /protein/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /carbs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fat/i })).toBeInTheDocument();
  });

  it('shows empty message when there are no data points', () => {
    render(<NutritionTrends />);
    expect(
      screen.getByText('No nutrition data logged in this time range.'),
    ).toBeInTheDocument();
  });

  it('renders a canvas chart element when data points are present', () => {
    hookState = {
      ...DEFAULT_HOOK_STATE,
      filteredPoints: [{ date: '2026-04-01', kcal: 2000, protein_g: 150, carbs_g: 200, fat_g: 70 }],
      chartData: {
        labels: ['2026-04-01'],
        datasets: [{ label: 'Calories (kcal)', data: [2000] }],
      },
    };
    render(<NutritionTrends />);
    // When data is present AsyncState renders the chart; a canvas element appears
    expect(document.querySelector('canvas')).toBeInTheDocument();
    // The empty-state message must NOT be visible
    expect(
      screen.queryByText('No nutrition data logged in this time range.'),
    ).not.toBeInTheDocument();
  });

  it('shows "Loading…" while loading', () => {
    hookState = { ...DEFAULT_HOOK_STATE, loading: true };
    render(<NutritionTrends />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows error message when error is set', () => {
    hookState = { ...DEFAULT_HOOK_STATE, error: 'Could not load nutrition trends.' };
    render(<NutritionTrends />);
    expect(screen.getByText('Could not load nutrition trends.')).toBeInTheDocument();
  });

  it('calls setFilter when a time-range button is clicked', () => {
    render(<NutritionTrends />);
    fireEvent.click(screen.getByRole('button', { name: '7 Days' }));
    expect(mockSetFilter).toHaveBeenCalledWith('week');
  });

  it('calls setActiveMacro when a macro toggle is clicked', () => {
    render(<NutritionTrends />);
    fireEvent.click(screen.getByRole('button', { name: /protein/i }));
    expect(mockSetActiveMacro).toHaveBeenCalledWith('protein');
  });

  it('displays summary stats when they are available', () => {
    hookState = {
      ...DEFAULT_HOOK_STATE,
      activeMacro: 'kcal',
      filteredPoints: [{ date: '2026-04-01', kcal: 2000, protein_g: 150, carbs_g: 200, fat_g: 70 }],
      chartData: { labels: ['2026-04-01'], datasets: [{ label: 'Calories (kcal)', data: [2000] }] },
      summaryStats: { avgKcal: 2000, avgProtein: 150, avgCarbs: 200, avgFat: 70, days: 1 },
    };
    render(<NutritionTrends />);
    expect(screen.getByText(/days logged/i)).toBeInTheDocument();
    expect(screen.getByText(/avg kcal/i)).toBeInTheDocument();
  });

  it('shows avg protein stat when activeMacro is "protein"', () => {
    hookState = {
      ...DEFAULT_HOOK_STATE,
      activeMacro: 'protein',
      filteredPoints: [{ date: '2026-04-01', kcal: 2000, protein_g: 150, carbs_g: 200, fat_g: 70 }],
      chartData: { labels: ['2026-04-01'], datasets: [{ label: 'Protein (g)', data: [150] }] },
      summaryStats: { avgKcal: 2000, avgProtein: 150, avgCarbs: 200, avgFat: 70, days: 1 },
    };
    render(<NutritionTrends />);
    expect(screen.getByText(/avg protein/i)).toBeInTheDocument();
  });

  it('shows avg carbs stat when activeMacro is "carbs"', () => {
    hookState = {
      ...DEFAULT_HOOK_STATE,
      activeMacro: 'carbs',
      filteredPoints: [{ date: '2026-04-01', kcal: 2000, protein_g: 150, carbs_g: 200, fat_g: 70 }],
      chartData: { labels: ['2026-04-01'], datasets: [{ label: 'Carbs (g)', data: [200] }] },
      summaryStats: { avgKcal: 2000, avgProtein: 150, avgCarbs: 200, avgFat: 70, days: 1 },
    };
    render(<NutritionTrends />);
    expect(screen.getByText(/avg carbs/i)).toBeInTheDocument();
  });

  it('shows avg fat stat when activeMacro is "fat"', () => {
    hookState = {
      ...DEFAULT_HOOK_STATE,
      activeMacro: 'fat',
      filteredPoints: [{ date: '2026-04-01', kcal: 2000, protein_g: 150, carbs_g: 200, fat_g: 70 }],
      chartData: { labels: ['2026-04-01'], datasets: [{ label: 'Fat (g)', data: [70] }] },
      summaryStats: { avgKcal: 2000, avgProtein: 150, avgCarbs: 200, avgFat: 70, days: 1 },
    };
    render(<NutritionTrends />);
    expect(screen.getByText(/avg fat/i)).toBeInTheDocument();
  });
});
