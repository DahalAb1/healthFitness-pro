import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockMealsToken = 'mock-token';

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ token: mockMealsToken }),
}));

vi.mock('@/utils/api', () => ({
  getMealLogs: vi.fn(),
  addMealLog: vi.fn(),
  deleteMealLog: vi.fn(),
}));

import { useMeals, MEAL_TYPES } from '@/hooks/useMeals';
import { getMealLogs, addMealLog, deleteMealLog } from '@/utils/api';

const TODAY_LOGS = [
  { id: 1, meal_type: 'breakfast', food_name: 'Oats',    kcal: 150 },
  { id: 2, meal_type: 'lunch',     food_name: 'Sandwich', kcal: 400 },
];

describe('useMeals', () => {
  beforeEach(() => {
    mockMealsToken = 'mock-token';
    getMealLogs.mockResolvedValue([]);
    addMealLog.mockResolvedValue({ id: 99, food_name: 'Apple', kcal: 95, meal_type: 'breakfast' });
    deleteMealLog.mockResolvedValue({});
  });

  it('exports MEAL_TYPES with the four expected types', () => {
    expect(MEAL_TYPES).toEqual(['breakfast', 'lunch', 'dinner', 'misc']);
  });

  it('initialises with empty meal buckets', () => {
    const { result } = renderHook(() => useMeals());
    expect(result.current.meals).toEqual({
      breakfast: [],
      lunch: [],
      dinner: [],
      misc: [],
    });
  });

  it('starts with totalCalories of 0', () => {
    const { result } = renderHook(() => useMeals());
    expect(result.current.totalCalories).toBe(0);
  });

  it('fetches today\'s meal logs from the API on mount', async () => {
    getMealLogs.mockResolvedValue(TODAY_LOGS);
    const { result } = renderHook(() => useMeals());
    await waitFor(() => expect(result.current.meals.breakfast).toHaveLength(1));
    expect(getMealLogs).toHaveBeenCalledWith('mock-token', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });

  it('groups fetched logs into the correct meal buckets', async () => {
    getMealLogs.mockResolvedValue(TODAY_LOGS);
    const { result } = renderHook(() => useMeals());
    await waitFor(() => expect(result.current.meals.lunch).toHaveLength(1));
    expect(result.current.meals.breakfast[0]).toMatchObject({ name: 'Oats', kcal: 150 });
    expect(result.current.meals.lunch[0]).toMatchObject({ name: 'Sandwich', kcal: 400 });
  });

  it('calculates totalCalories from all loaded meals', async () => {
    getMealLogs.mockResolvedValue(TODAY_LOGS);
    const { result } = renderHook(() => useMeals());
    await waitFor(() => expect(result.current.totalCalories).toBe(550));
  });

  it('falls back to empty meals when the API call fails', async () => {
    getMealLogs.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useMeals());
    await waitFor(() => expect(getMealLogs).toHaveBeenCalled());
    expect(result.current.meals).toEqual({ breakfast: [], lunch: [], dinner: [], misc: [] });
  });

  it('adds a food item to the correct meal bucket via addToMeal', async () => {
    const { result } = renderHook(() => useMeals());
    await waitFor(() => expect(getMealLogs).toHaveBeenCalled());
    await act(async () => {
      await result.current.addToMeal('breakfast', { name: 'Apple', kcal: 95 });
    });
    expect(result.current.meals.breakfast).toHaveLength(1);
    expect(result.current.meals.breakfast[0]).toMatchObject({ name: 'Apple', kcal: 95 });
  });

  it('persists a new meal item to the API via addToMeal', async () => {
    const { result } = renderHook(() => useMeals());
    await waitFor(() => expect(getMealLogs).toHaveBeenCalled());
    await act(async () => {
      await result.current.addToMeal('lunch', { name: 'Salad', kcal: 120 });
    });
    expect(addMealLog).toHaveBeenCalledWith('mock-token', expect.objectContaining({
      meal_type: 'lunch',
      food_name: 'Salad',
      kcal: 120,
    }));
  });

  it('updates totalCalories after adding a food item', async () => {
    addMealLog.mockResolvedValue({ id: 10, food_name: 'Banana', kcal: 105, meal_type: 'snack' });
    const { result } = renderHook(() => useMeals());
    await waitFor(() => expect(getMealLogs).toHaveBeenCalled());
    await act(async () => {
      await result.current.addToMeal('misc', { name: 'Banana', kcal: 105 });
    });
    expect(result.current.totalCalories).toBe(105);
  });

  it('removes a food item optimistically from the meal bucket', async () => {
    getMealLogs.mockResolvedValue([
      { id: 5, meal_type: 'dinner', food_name: 'Steak', kcal: 600 },
    ]);
    const { result } = renderHook(() => useMeals());
    await waitFor(() => expect(result.current.meals.dinner).toHaveLength(1));
    await act(async () => {
      await result.current.removeFromMeal('dinner', 0);
    });
    expect(result.current.meals.dinner).toHaveLength(0);
  });

  it('calls deleteMealLog with the item id when removing', async () => {
    getMealLogs.mockResolvedValue([
      { id: 7, meal_type: 'lunch', food_name: 'Wrap', kcal: 350 },
    ]);
    const { result } = renderHook(() => useMeals());
    await waitFor(() => expect(result.current.meals.lunch).toHaveLength(1));
    await act(async () => {
      await result.current.removeFromMeal('lunch', 0);
    });
    expect(deleteMealLog).toHaveBeenCalledWith('mock-token', 7);
  });

  it('decreases totalCalories after removing a food item', async () => {
    getMealLogs.mockResolvedValue([
      { id: 3, meal_type: 'breakfast', food_name: 'Toast', kcal: 80 },
    ]);
    const { result } = renderHook(() => useMeals());
    await waitFor(() => expect(result.current.totalCalories).toBe(80));
    await act(async () => {
      await result.current.removeFromMeal('breakfast', 0);
    });
    expect(result.current.totalCalories).toBe(0);
  });

  // -----------------------------------------------------------------------
  // Branch coverage additions
  // -----------------------------------------------------------------------

  it('resets to empty meals when token becomes null (useEffect if-branch)', async () => {
    getMealLogs.mockResolvedValue(TODAY_LOGS);
    const { result, rerender } = renderHook(() => useMeals());
    await waitFor(() => expect(result.current.meals.breakfast).toHaveLength(1));

    mockMealsToken = null;
    rerender();
    await waitFor(() => expect(result.current.meals).toEqual({
      breakfast: [], lunch: [], dinner: [], misc: [],
    }));
  });

  it('addToMeal is a no-op when token is null', async () => {
    mockMealsToken = null;
    addMealLog.mockClear();
    const { result } = renderHook(() => useMeals());
    await act(async () => {
      await result.current.addToMeal('breakfast', { name: 'Toast', kcal: 80 });
    });
    expect(addMealLog).not.toHaveBeenCalled();
    expect(result.current.meals.breakfast).toHaveLength(0);
  });

  it('removeFromMeal is a no-op when token is null', async () => {
    getMealLogs.mockResolvedValue([
      { id: 5, meal_type: 'dinner', food_name: 'Steak', kcal: 600 },
    ]);
    const { result, rerender } = renderHook(() => useMeals());
    await waitFor(() => expect(result.current.meals.dinner).toHaveLength(1));

    mockMealsToken = null;
    deleteMealLog.mockClear();
    rerender();
    await waitFor(() => expect(result.current.meals.dinner).toHaveLength(0));

    // now call removeFromMeal with null token — should be a no-op (no deleteMealLog call)
    await act(async () => {
      await result.current.removeFromMeal('dinner', 0);
    });
    expect(deleteMealLog).not.toHaveBeenCalled();
  });

  it('groupByMealType ignores logs with unknown meal_type (else branch)', async () => {
    getMealLogs.mockResolvedValue([
      { id: 1, meal_type: 'snack', food_name: 'Cookie', kcal: 100 },
    ]);
    const { result } = renderHook(() => useMeals());
    await waitFor(() => expect(getMealLogs).toHaveBeenCalled());
    // 'snack' is not in MEAL_TYPES so it should be dropped
    const allItems = Object.values(result.current.meals).flat();
    expect(allItems).toHaveLength(0);
  });
});
