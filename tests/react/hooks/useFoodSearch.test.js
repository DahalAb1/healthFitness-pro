import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockSearchFoods = vi.fn();

vi.mock('@/utils/api', () => ({
  searchFoods: (...args) => mockSearchFoods(...args),
}));

import { useFoodSearch } from '@/hooks/useFoodSearch';

const MOCK_FOODS = {
  foods: [
    { food_name: 'Apple', calories: 52, serving_description: '1 medium' },
    { food_name: 'Banana', calories: 89, serving_description: '1 medium' },
  ],
};

describe('useFoodSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSearchFoods.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initialises with empty state', () => {
    const { result } = renderHook(() => useFoodSearch());
    expect(result.current.searchQuery).toBe('');
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.customName).toBe('');
    expect(result.current.customKcal).toBe('');
  });

  it('does not call searchFoods when query is empty', async () => {
    const { result } = renderHook(() => useFoodSearch());
    act(() => { result.current.setSearchQuery(''); });
    act(() => { vi.advanceTimersByTime(600); });
    expect(mockSearchFoods).not.toHaveBeenCalled();
  });

  it('does not call searchFoods when query is only whitespace', async () => {
    const { result } = renderHook(() => useFoodSearch());
    act(() => { result.current.setSearchQuery('   '); });
    act(() => { vi.advanceTimersByTime(600); });
    expect(mockSearchFoods).not.toHaveBeenCalled();
  });

  it('debounces the API call for 500ms', async () => {
    mockSearchFoods.mockResolvedValue(MOCK_FOODS);
    const { result } = renderHook(() => useFoodSearch());
    act(() => { result.current.setSearchQuery('apple'); });
    // Not called before debounce fires
    expect(mockSearchFoods).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(499); });
    expect(mockSearchFoods).not.toHaveBeenCalled();
    // Called after 500ms
    await act(async () => { vi.advanceTimersByTime(1); });
    expect(mockSearchFoods).toHaveBeenCalledWith('apple');
  });

  it('normalizes API results into searchResults', async () => {
    mockSearchFoods.mockResolvedValue(MOCK_FOODS);
    const { result } = renderHook(() => useFoodSearch());
    act(() => { result.current.setSearchQuery('apple'); });
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(result.current.isSearching).toBe(false);
    expect(result.current.searchResults).toEqual([
      { name: 'Apple', kcal: 52, serving_description: '1 medium' },
      { name: 'Banana', kcal: 89, serving_description: '1 medium' },
    ]);
  });

  it('sets searchResults to empty array when API call fails', async () => {
    mockSearchFoods.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useFoodSearch());
    act(() => { result.current.setSearchQuery('error'); });
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(result.current.isSearching).toBe(false);
    expect(result.current.searchResults).toEqual([]);
  });

  it('clears apiResults when query is cleared', async () => {
    mockSearchFoods.mockResolvedValue(MOCK_FOODS);
    const { result } = renderHook(() => useFoodSearch());
    act(() => { result.current.setSearchQuery('apple'); });
    await act(async () => { await vi.runAllTimersAsync(); });
    expect(result.current.searchResults.length).toBeGreaterThan(0);

    act(() => { result.current.setSearchQuery(''); });
    expect(result.current.searchResults).toEqual([]);
  });

  it('handleAddCustom adds a custom food to searchResults', () => {
    const { result } = renderHook(() => useFoodSearch());
    act(() => {
      result.current.setCustomName('Protein Bar');
      result.current.setCustomKcal('200');
    });
    act(() => { result.current.handleAddCustom(); });
    expect(result.current.searchResults).toContainEqual(
      expect.objectContaining({ name: 'Protein Bar', kcal: 200 })
    );
  });

  it('handleAddCustom sets searchQuery to the custom food name', () => {
    const { result } = renderHook(() => useFoodSearch());
    act(() => {
      result.current.setCustomName('Protein Bar');
      result.current.setCustomKcal('200');
    });
    act(() => { result.current.handleAddCustom(); });
    expect(result.current.searchQuery).toBe('Protein Bar');
  });

  it('handleAddCustom clears customName and customKcal after adding', () => {
    const { result } = renderHook(() => useFoodSearch());
    act(() => {
      result.current.setCustomName('Protein Bar');
      result.current.setCustomKcal('200');
    });
    act(() => { result.current.handleAddCustom(); });
    expect(result.current.customName).toBe('');
    expect(result.current.customKcal).toBe('');
  });

  it('handleAddCustom does not add when name or kcal is empty', () => {
    const { result } = renderHook(() => useFoodSearch());
    act(() => { result.current.handleAddCustom(); });
    // No custom food added with empty data
    expect(result.current.searchResults).toEqual([]);
  });

  it('custom foods are filtered by the current searchQuery', () => {
    const { result } = renderHook(() => useFoodSearch());
    // Add two custom foods
    act(() => {
      result.current.setCustomName('Protein Bar');
      result.current.setCustomKcal('200');
    });
    act(() => { result.current.handleAddCustom(); });
    act(() => {
      result.current.setCustomName('Oat Cookie');
      result.current.setCustomKcal('150');
    });
    act(() => { result.current.handleAddCustom(); });

    // Filter by "protein"
    act(() => { result.current.setSearchQuery('protein'); });
    act(() => { vi.advanceTimersByTime(100); }); // don't fire debounce for API

    const names = result.current.searchResults.map((f) => f.name);
    expect(names).toContain('Protein Bar');
    expect(names).not.toContain('Oat Cookie');
  });

  it('all custom foods shown when query is empty', () => {
    const { result } = renderHook(() => useFoodSearch());
    act(() => {
      result.current.setCustomName('Protein Bar');
      result.current.setCustomKcal('200');
    });
    act(() => { result.current.handleAddCustom(); });
    // Clear search query
    act(() => { result.current.setSearchQuery(''); });
    expect(result.current.searchResults).toContainEqual(
      expect.objectContaining({ name: 'Protein Bar' })
    );
  });

  it('cancels previous debounce timer when query changes rapidly', async () => {
    mockSearchFoods.mockResolvedValue(MOCK_FOODS);
    const { result } = renderHook(() => useFoodSearch());
    act(() => { result.current.setSearchQuery('a'); });
    act(() => { vi.advanceTimersByTime(200); });
    act(() => { result.current.setSearchQuery('ap'); });
    act(() => { vi.advanceTimersByTime(200); });
    act(() => { result.current.setSearchQuery('apple'); });
    await act(async () => { vi.advanceTimersByTime(500); });
    // Only one call for the final query
    expect(mockSearchFoods).toHaveBeenCalledTimes(1);
    expect(mockSearchFoods).toHaveBeenCalledWith('apple');
  });
});
