import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetNutritionTrends = vi.fn();
let mockToken = 'test-token';

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ token: mockToken }),
}));

vi.mock('@/utils/api', () => ({
  getNutritionTrends: (...args) => mockGetNutritionTrends(...args),
}));

import { useNutritionTrends, MACRO_KEYS } from '@/hooks/useNutritionTrends';

// Points spread across different dates so filter tests are deterministic.
function makePoint(daysAgo, overrides = {}) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    date: d.toISOString().split('T')[0],
    kcal: 2000,
    protein_g: 150,
    carbs_g: 200,
    fat_g: 70,
    ...overrides,
  };
}

const SAMPLE_POINTS = [
  makePoint(2,  { kcal: 1800, protein_g: 120, carbs_g: 180, fat_g: 60 }),
  makePoint(15, { kcal: 2200, protein_g: 160, carbs_g: 220, fat_g: 80 }),
  makePoint(60, { kcal: 2400, protein_g: 180, carbs_g: 260, fat_g: 90 }),
];

describe('useNutritionTrends', () => {
  beforeEach(() => {
    mockToken = 'test-token';
    mockGetNutritionTrends.mockReset();
  });

  it('exports MACRO_KEYS with the four expected macros', () => {
    expect(MACRO_KEYS).toEqual(['kcal', 'protein', 'carbs', 'fat']);
  });

  it('initialises with default state before any fetch', () => {
    mockGetNutritionTrends.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useNutritionTrends());
    expect(result.current.filter).toBe('month');
    expect(result.current.activeMacro).toBe('kcal');
    expect(result.current.filteredPoints).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.summaryStats).toBeNull();
  });

  it('does not fetch when token is null', () => {
    mockToken = null;
    renderHook(() => useNutritionTrends());
    expect(mockGetNutritionTrends).not.toHaveBeenCalled();
  });

  it('fetches data on mount when token is present', async () => {
    mockGetNutritionTrends.mockResolvedValue(SAMPLE_POINTS);
    renderHook(() => useNutritionTrends());
    await waitFor(() => expect(mockGetNutritionTrends).toHaveBeenCalledWith('test-token', null));
  });

  it('sets loading to false after a successful fetch', async () => {
    mockGetNutritionTrends.mockResolvedValue(SAMPLE_POINTS);
    const { result } = renderHook(() => useNutritionTrends());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('populates filteredPoints with points that fall within the "month" filter window', async () => {
    mockGetNutritionTrends.mockResolvedValue(SAMPLE_POINTS);
    const { result } = renderHook(() => useNutritionTrends());
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Default filter is 'month' (30 days). Points at 2 and 15 days ago are in range;
    // the point at 60 days ago should be excluded.
    expect(result.current.filteredPoints).toHaveLength(2);
  });

  it('shows all points when filter is "all"', async () => {
    mockGetNutritionTrends.mockResolvedValue(SAMPLE_POINTS);
    const { result } = renderHook(() => useNutritionTrends());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setFilter('all'); });
    expect(result.current.filteredPoints).toHaveLength(3);
  });

  it('shows only points within 7 days when filter is "week"', async () => {
    mockGetNutritionTrends.mockResolvedValue(SAMPLE_POINTS);
    const { result } = renderHook(() => useNutritionTrends());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setFilter('week'); });
    // Only the point 2 days ago should be in range.
    expect(result.current.filteredPoints).toHaveLength(1);
  });

  it('sets error when API call rejects', async () => {
    mockGetNutritionTrends.mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useNutritionTrends());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Could not load nutrition trends.');
    expect(result.current.filteredPoints).toEqual([]);
  });

  it('setActiveMacro changes the activeMacro value', async () => {
    mockGetNutritionTrends.mockResolvedValue([]);
    const { result } = renderHook(() => useNutritionTrends());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setActiveMacro('protein'); });
    expect(result.current.activeMacro).toBe('protein');
  });

  it('chartData contains labels matching filteredPoints dates', async () => {
    mockGetNutritionTrends.mockResolvedValue(SAMPLE_POINTS);
    const { result } = renderHook(() => useNutritionTrends());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setFilter('all'); });
    expect(result.current.chartData.labels).toHaveLength(3);
    expect(result.current.chartData.labels[0]).toBe(SAMPLE_POINTS[0].date);
  });

  it('chartData datasets reflect the active macro', async () => {
    mockGetNutritionTrends.mockResolvedValue(SAMPLE_POINTS);
    const { result } = renderHook(() => useNutritionTrends());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.setFilter('all');
      result.current.setActiveMacro('fat');
    });
    const dataset = result.current.chartData.datasets[0];
    expect(dataset.label).toContain('Fat');
  });

  it('summaryStats is null when there are no filtered points', async () => {
    mockGetNutritionTrends.mockResolvedValue([]);
    const { result } = renderHook(() => useNutritionTrends());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.summaryStats).toBeNull();
  });

  it('summaryStats computes averages correctly', async () => {
    // Use two points with known values inside the 'all' window
    const points = [
      makePoint(1, { kcal: 2000, protein_g: 100, carbs_g: 200, fat_g: 50 }),
      makePoint(2, { kcal: 2000, protein_g: 100, carbs_g: 200, fat_g: 50 }),
    ];
    mockGetNutritionTrends.mockResolvedValue(points);
    const { result } = renderHook(() => useNutritionTrends());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setFilter('all'); });
    expect(result.current.summaryStats).toMatchObject({
      avgKcal: 2000,
      avgProtein: 100,
      avgCarbs: 200,
      avgFat: 50,
      days: 2,
    });
  });

  it('summaryStats handles a zero kcal value via the || 0 fallback', async () => {
    const points = [makePoint(1, { kcal: 0, protein_g: 50, carbs_g: 100, fat_g: 20 })];
    mockGetNutritionTrends.mockResolvedValue(points);
    const { result } = renderHook(() => useNutritionTrends());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setFilter('all'); });
    expect(result.current.summaryStats.avgKcal).toBe(0);
  });
});
