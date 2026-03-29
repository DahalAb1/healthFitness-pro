import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetProgressWeights = vi.fn();
let mockToken = 'test-token';

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ token: mockToken }),
}));

vi.mock('@/utils/api', () => ({
  getProgressWeights: (...args) => mockGetProgressWeights(...args),
}));

import { usePerformanceTrends } from '@/hooks/usePerformanceTrends';

const SAMPLE_POINTS = [
  { date: '2026-01-10', weight: 100 },
  { date: '2026-02-15', weight: 105 },
  { date: '2026-03-20', weight: 110 },
];

describe('usePerformanceTrends', () => {
  beforeEach(() => {
    mockToken = 'test-token';
    mockGetProgressWeights.mockReset();
  });

  it('initialises with default state', () => {
    const { result } = renderHook(() => usePerformanceTrends());
    expect(result.current.filter).toBe('month');
    expect(result.current.inputValue).toBe('');
    expect(result.current.exerciseName).toBe('');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.filteredPoints).toEqual([]);
    expect(result.current.meta).toBeNull();
  });

  it('does not fetch when exerciseName is empty', () => {
    const { result } = renderHook(() => usePerformanceTrends());
    expect(mockGetProgressWeights).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('handleSearch updates inputValue and sets exerciseName on submit', async () => {
    mockGetProgressWeights.mockResolvedValue({ points: [], first_weight: null, latest_weight: null });
    const { result } = renderHook(() => usePerformanceTrends());
    act(() => { result.current.setInputValue('Bench Press'); });
    await act(async () => {
      result.current.handleSearch({ preventDefault: vi.fn() });
    });
    expect(result.current.exerciseName).toBe('Bench Press');
    expect(mockGetProgressWeights).toHaveBeenCalledWith('test-token', 'Bench Press');
  });

  it('handleSearch ignores submission of empty/whitespace input', async () => {
    const { result } = renderHook(() => usePerformanceTrends());
    act(() => { result.current.setInputValue('   '); });
    await act(async () => {
      result.current.handleSearch({ preventDefault: vi.fn() });
    });
    expect(result.current.exerciseName).toBe('');
    expect(mockGetProgressWeights).not.toHaveBeenCalled();
  });

  it('populates filteredPoints and meta after successful fetch', async () => {
    const apiData = { points: SAMPLE_POINTS, first_weight: 100, latest_weight: 110 };
    mockGetProgressWeights.mockResolvedValue(apiData);
    const { result } = renderHook(() => usePerformanceTrends());
    act(() => { result.current.setInputValue('Squat'); });
    await act(async () => {
      result.current.handleSearch({ preventDefault: vi.fn() });
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.meta).toEqual(apiData);
    // All points within Infinity range (month filter) should be included
    expect(result.current.filteredPoints.length).toBeGreaterThan(0);
  });

  it('sets error when API call fails', async () => {
    mockGetProgressWeights.mockRejectedValue(new Error('Not found'));
    const { result } = renderHook(() => usePerformanceTrends());
    act(() => { result.current.setInputValue('Unknown'); });
    await act(async () => {
      result.current.handleSearch({ preventDefault: vi.fn() });
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.filteredPoints).toEqual([]);
    expect(result.current.meta).toBeNull();
  });

  it('setFilter changes the filter value', () => {
    const { result } = renderHook(() => usePerformanceTrends());
    act(() => { result.current.setFilter('day'); });
    expect(result.current.filter).toBe('day');
  });

  it('filteredPoints respect the "day" (7-day) filter', async () => {
    // Points: one is very old, one is recent (within 7 days from now)
    const today = new Date();
    const recentDate = new Date(today);
    recentDate.setDate(today.getDate() - 3);
    const oldDate = new Date(today);
    oldDate.setDate(today.getDate() - 20);
    const points = [
      { date: oldDate.toISOString().split('T')[0], weight: 80 },
      { date: recentDate.toISOString().split('T')[0], weight: 85 },
    ];
    mockGetProgressWeights.mockResolvedValue({ points });
    const { result } = renderHook(() => usePerformanceTrends());
    act(() => { result.current.setFilter('day'); result.current.setInputValue('Curl'); });
    await act(async () => {
      result.current.handleSearch({ preventDefault: vi.fn() });
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.filteredPoints).toHaveLength(1);
    expect(result.current.filteredPoints[0].weight).toBe(85);
  });

  it('chartData contains labels and a dataset', async () => {
    mockGetProgressWeights.mockResolvedValue({ points: SAMPLE_POINTS });
    const { result } = renderHook(() => usePerformanceTrends());
    act(() => { result.current.setInputValue('Deadlift'); });
    await act(async () => {
      result.current.handleSearch({ preventDefault: vi.fn() });
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.chartData).toHaveProperty('labels');
    expect(result.current.chartData).toHaveProperty('datasets');
    expect(Array.isArray(result.current.chartData.datasets)).toBe(true);
  });

  it('does not call API when token is null', async () => {
    mockToken = null;
    const { result } = renderHook(() => usePerformanceTrends());
    act(() => { result.current.setInputValue('Bench'); });
    await act(async () => {
      result.current.handleSearch({ preventDefault: vi.fn() });
    });
    expect(mockGetProgressWeights).not.toHaveBeenCalled();
  });
});
