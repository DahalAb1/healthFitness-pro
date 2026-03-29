import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetWorkouts = vi.fn();
const mockGetNutritionActiveDates = vi.fn();
const mockGetWorkoutByDate = vi.fn();
const mockGetMealLogs = vi.fn();
let mockToken = 'test-token';

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ token: mockToken }),
}));

vi.mock('@/utils/api', () => ({
  getWorkouts: (...args) => mockGetWorkouts(...args),
  getNutritionActiveDates: (...args) => mockGetNutritionActiveDates(...args),
  getWorkoutByDate: (...args) => mockGetWorkoutByDate(...args),
  getMealLogs: (...args) => mockGetMealLogs(...args),
}));

import { useCalendar } from '@/hooks/useCalendar';

const WORKOUT_SESSIONS = [
  { workout_date: '2026-03-05' },
  { workout_date: '2026-03-15' },
];

describe('useCalendar', () => {
  beforeEach(() => {
    mockToken = 'test-token';
    mockGetWorkouts.mockReset();
    mockGetNutritionActiveDates.mockReset();
    mockGetWorkoutByDate.mockReset();
    mockGetMealLogs.mockReset();
    // Default setup
    mockGetWorkouts.mockResolvedValue([]);
    mockGetNutritionActiveDates.mockResolvedValue({ days: [] });
    mockGetWorkoutByDate.mockResolvedValue(null);
    mockGetMealLogs.mockResolvedValue([]);
  });

  it('initialises with current month/year, no selected day, no workout', () => {
    const { result } = renderHook(() => useCalendar());
    const now = new Date();
    expect(result.current.month).toBe(now.getMonth());
    expect(result.current.year).toBe(now.getFullYear());
    expect(result.current.selectedDay).toBeNull();
    expect(result.current.workout).toBeNull();
    expect(result.current.mealLogs).toEqual([]);
    expect(result.current.loadingDetail).toBe(false);
  });

  it('provides correct daysInMonth for the initial month', () => {
    const { result } = renderHook(() => useCalendar());
    const now = new Date();
    const expectedDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    expect(result.current.daysInMonth).toBe(expectedDays);
  });

  it('provides correct firstDay for the initial month', () => {
    const { result } = renderHook(() => useCalendar());
    const now = new Date();
    const expectedFirstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    expect(result.current.firstDay).toBe(expectedFirstDay);
  });

  it('changeMonth(1) advances to the next month', () => {
    const { result } = renderHook(() => useCalendar());
    const now = new Date();
    const currentMonth = now.getMonth();
    act(() => { result.current.changeMonth(1); });
    const expectedMonth = (currentMonth + 1) % 12;
    expect(result.current.month).toBe(expectedMonth);
  });

  it('changeMonth(-1) goes back to the previous month', async () => {
    const { result } = renderHook(() => useCalendar());
    const now = new Date();
    const currentMonth = now.getMonth();
    await act(async () => { result.current.changeMonth(-1); });
    const expectedMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    expect(result.current.month).toBe(expectedMonth);
  });

  it('changeMonth resets selectedDay, workout, and mealLogs', async () => {
    mockGetWorkoutByDate.mockResolvedValue({ id: 1, exercises: [] });
    mockGetMealLogs.mockResolvedValue([{ id: 1, name: 'Salad' }]);
    const { result } = renderHook(() => useCalendar());
    await act(async () => { result.current.handleDayClick(10); });
    await waitFor(() => expect(result.current.workout).toEqual({ id: 1, exercises: [] }));

    act(() => { result.current.changeMonth(1); });
    expect(result.current.selectedDay).toBeNull();
    expect(result.current.workout).toBeNull();
    expect(result.current.mealLogs).toEqual([]);
  });

  it('loads workoutDays and nutritionDays on mount when token is present', async () => {
    mockGetWorkouts.mockResolvedValue(WORKOUT_SESSIONS);
    mockGetNutritionActiveDates.mockResolvedValue({ days: [5, 12, 20] });
    const { result } = renderHook(() => useCalendar());
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    // Only sessions that match current month/year are added to workoutDays
    await waitFor(() => {
      expect(mockGetWorkouts).toHaveBeenCalledWith('test-token');
      expect(mockGetNutritionActiveDates).toHaveBeenCalledWith('test-token', currentYear, currentMonth + 1);
    });
  });

  it('skips API calls when token is null', () => {
    mockToken = null;
    renderHook(() => useCalendar());
    expect(mockGetWorkouts).not.toHaveBeenCalled();
    expect(mockGetNutritionActiveDates).not.toHaveBeenCalled();
  });

  it('handleDayClick sets selectedDay and loads workout + meals', async () => {
    const mockWorkout = { id: 99, exercises: [{ name: 'Squat' }] };
    const mockMeals = [{ id: 1, name: 'Chicken' }];
    mockGetWorkoutByDate.mockResolvedValue(mockWorkout);
    mockGetMealLogs.mockResolvedValue(mockMeals);
    const { result } = renderHook(() => useCalendar());
    await act(async () => { result.current.handleDayClick(15); });
    await waitFor(() => expect(result.current.loadingDetail).toBe(false));
    expect(result.current.selectedDay).toBe(15);
    expect(result.current.workout).toEqual(mockWorkout);
    expect(result.current.mealLogs).toEqual(mockMeals);
  });

  it('handleDayClick sets workout=null when API returns null', async () => {
    mockGetWorkoutByDate.mockResolvedValue(null);
    mockGetMealLogs.mockResolvedValue([]);
    const { result } = renderHook(() => useCalendar());
    await act(async () => { result.current.handleDayClick(5); });
    await waitFor(() => expect(result.current.loadingDetail).toBe(false));
    expect(result.current.workout).toBeNull();
  });

  it('handleDayClick sets empty mealLogs when API call fails', async () => {
    mockGetMealLogs.mockRejectedValue(new Error('fail'));
    mockGetWorkoutByDate.mockResolvedValue(null);
    const { result } = renderHook(() => useCalendar());
    await act(async () => { result.current.handleDayClick(5); });
    await waitFor(() => expect(result.current.loadingDetail).toBe(false));
    expect(result.current.mealLogs).toEqual([]);
  });
});
