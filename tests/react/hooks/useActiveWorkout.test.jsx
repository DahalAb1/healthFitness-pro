import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams('source=template&id=1');
const mockGetTemplateExercises = vi.fn();
const mockGetExercises = vi.fn();
const mockLogWorkout = vi.fn();
let mockToken = 'test-token';
const mockNormalizeCustomExercise = vi.fn((ex) => ({
  name: ex.exercise_name || ex.name || '',
  sets: ex.sets || 3,
  reps: ex.reps || 10,
  imageUrl: '',
  muscleGroup: '',
  equipment: '',
}));

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ token: mockToken }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, vi.fn()],
  };
});

vi.mock('@/utils/api', () => ({
  getTemplateExercises: (...args) => mockGetTemplateExercises(...args),
  getExercises: (...args) => mockGetExercises(...args),
  logWorkout: (...args) => mockLogWorkout(...args),
}));

vi.mock('@/utils/exerciseNormalizers', () => ({
  normalizeTemplateExercise: (ex) => ({
    name: ex.exercise_name || ex.name || '',
    sets: ex.sets || 3,
    reps: ex.reps || 10,
    imageUrl: ex.image_url || '',
    muscleGroup: ex.muscle_group || '',
    equipment: ex.equipment || '',
  }),
  normalizeCustomExercise: (...args) => mockNormalizeCustomExercise(...args),
}));

import { useActiveWorkout } from '@/hooks/useActiveWorkout';

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

const TEMPLATE_EXERCISES_RESPONSE = {
  exercises: [
    { exercise_name: 'Bench Press', sets: 3, reps: 8 },
    { exercise_name: 'Overhead Press', sets: 3, reps: 10 },
  ],
};

describe('useActiveWorkout', () => {
  beforeEach(() => {
    mockToken = 'test-token';
    mockSearchParams = new URLSearchParams('source=template&id=1');
    mockNavigate.mockReset();
    mockGetTemplateExercises.mockReset();
    mockGetExercises.mockReset();
    mockLogWorkout.mockReset();
    mockGetExercises.mockResolvedValue([]);
    mockNormalizeCustomExercise.mockReset();
    mockNormalizeCustomExercise.mockImplementation((ex) => ({
      name: ex.exercise_name || ex.name || '',
      sets: ex.sets || 3,
      reps: ex.reps || 10,
      imageUrl: '',
      muscleGroup: '',
      equipment: '',
    }));
    sessionStorage.clear();
    sessionStorage.setItem('activeWorkoutName', 'Test Workout');
  });

  it('navigates to /workout-template when source or id params are missing', async () => {
    mockSearchParams = new URLSearchParams('');
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/workout-template'));
  });

  it('loads exercises from API for template source', async () => {
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetTemplateExercises).toHaveBeenCalledWith(1);
    expect(result.current.exercises).toHaveLength(2);
    expect(result.current.exercises[0].name).toBe('Bench Press');
  });

  it('initialises setLogs with one set per exercise row', async () => {
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.setLogs).toHaveLength(2);
    expect(result.current.setLogs[0]).toHaveLength(3); // 3 sets
  });

  it('sets workoutName from sessionStorage', async () => {
    sessionStorage.setItem('activeWorkoutName', 'Push Day');
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.workoutName).toBe('Push Day');
  });

  it('loads exercises from sessionStorage for custom source', async () => {
    const customExercises = [
      { exercise_name: 'Squat', sets: 4, reps: 6 },
    ];
    mockSearchParams = new URLSearchParams('source=custom&id=1');
    sessionStorage.setItem('activeWorkoutExercises', JSON.stringify(customExercises));
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.exercises).toHaveLength(1);
    expect(result.current.exercises[0].name).toBe('Squat');
  });

  it('navigates to /workout-template for unknown source', async () => {
    mockSearchParams = new URLSearchParams('source=unknown&id=1');
    renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/workout-template'));
  });

  it('handleSetUpdate updates a set log field', async () => {
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.handleSetUpdate(0, 0, 'weight', '135'); });
    expect(result.current.setLogs[0][0].weight).toBe('135');
  });

  it('handleSetUpdate with done=true makes timerVisible=true', async () => {
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.handleSetUpdate(0, 0, 'done', true); });
    expect(result.current.timerVisible).toBe(true);
  });

  it('handleNext advances currentIndex', async () => {
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.currentIndex).toBe(0);
    act(() => { result.current.handleNext(); });
    expect(result.current.currentIndex).toBe(1);
  });

  it('handleNext hides timer when advancing', async () => {
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.setTimerVisible(true); });
    act(() => { result.current.handleNext(); });
    expect(result.current.timerVisible).toBe(false);
  });

  it('handleBack decrements currentIndex', async () => {
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.handleNext(); });
    expect(result.current.currentIndex).toBe(1);
    act(() => { result.current.handleBack(); });
    expect(result.current.currentIndex).toBe(0);
  });

  it('handleBack does not go below 0', async () => {
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.handleBack(); });
    expect(result.current.currentIndex).toBe(0);
  });

  it('handleEnd calls finish when user confirms', async () => {
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    mockLogWorkout.mockResolvedValue({});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.handleEnd(); });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/history'));
    window.confirm.mockRestore?.();
  });

  it('handleEnd does not call finish when user cancels', async () => {
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => { result.current.handleEnd(); });
    expect(mockLogWorkout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith('/history');
    window.confirm.mockRestore?.();
  });

  // -----------------------------------------------------------------------
  // Branch coverage additions
  // -----------------------------------------------------------------------

  it('workoutName falls back to "Workout" when sessionStorage is empty', async () => {
    sessionStorage.removeItem('activeWorkoutName');
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.workoutName).toBe('Workout');
  });

  it('uses empty array when data.exercises is undefined', async () => {
    mockGetTemplateExercises.mockResolvedValue({}); // no exercises key
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.exercises).toEqual([]);
    expect(result.current.setLogs).toEqual([]);
  });

  it('handles getTemplateExercises rejection gracefully', async () => {
    mockGetTemplateExercises.mockRejectedValue(new Error('API error'));
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.exercises).toEqual([]);
  });

  it('uses empty array for custom source when no exercises in sessionStorage', async () => {
    mockSearchParams = new URLSearchParams('source=custom&id=1');
    sessionStorage.removeItem('activeWorkoutExercises');
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.exercises).toEqual([]);
  });

  it('enriches custom exercises when libraryItems are returned', async () => {
    const customExercises = [{ exercise_name: 'Squat', sets: 3, reps: 8 }];
    const libraryItems = [{ name: 'Squat', image_url: 'img.png', muscle_group: 'legs', equipment: 'barbell' }];
    mockSearchParams = new URLSearchParams('source=custom&id=1');
    sessionStorage.setItem('activeWorkoutExercises', JSON.stringify(customExercises));
    mockGetExercises.mockResolvedValue(libraryItems);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(mockGetExercises).toHaveBeenCalled());
    // After enrichment the exercise should have image/muscle info
    await waitFor(() => expect(result.current.exercises[0].imageUrl).toBe('img.png'));
  });

  it('finish guard: does not call logWorkout twice when finish() is in progress', async () => {
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    mockLogWorkout.mockImplementation(() => new Promise(() => {})); // never resolves
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Start finish once (it hangs)
    act(() => { result.current.handleEnd(); });
    // Immediately call handleNext to try to finish again (should be a no-op via finishing guard)
    act(() => { result.current.handleEnd(); });
    expect(mockLogWorkout).toHaveBeenCalledTimes(1);
    window.confirm.mockRestore?.();
  });

  it('finish uses all set logs when no sets are marked done', async () => {
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    mockLogWorkout.mockResolvedValue({});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Do not mark any set as done — doneLogs.length === 0
    await act(async () => { await result.current.handleEnd(); });
    await waitFor(() => expect(mockLogWorkout).toHaveBeenCalled());
    const [payload] = mockLogWorkout.mock.calls[0];
    // Should still log exercises (using all logs as fallback)
    expect(payload.exercises).toHaveLength(2);
    window.confirm.mockRestore?.();
  });

  it('finish shows alert and navigates when token is null', async () => {
    mockToken = null;
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.handleEnd(); });
    await waitFor(() => expect(mockAlert).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/history');
    mockAlert.mockRestore();
    window.confirm.mockRestore?.();
  });

  it('finish catch: shows alert when logWorkout rejects', async () => {
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    mockLogWorkout.mockRejectedValue(new Error('server error'));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.handleEnd(); });
    await waitFor(() => expect(mockAlert).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/history');
    mockAlert.mockRestore();
    window.confirm.mockRestore?.();
  });

  it('handleNext on last exercise calls finish', async () => {
    mockGetTemplateExercises.mockResolvedValue(TEMPLATE_EXERCISES_RESPONSE);
    mockLogWorkout.mockResolvedValue({});
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Advance to last exercise
    act(() => { result.current.handleNext(); });
    expect(result.current.currentIndex).toBe(1);
    // handleNext again should call finish (index === length - 1)
    await act(async () => { await result.current.handleNext(); });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/history'));
  });

  // -----------------------------------------------------------------------
  // Enrichment branch coverage
  // -----------------------------------------------------------------------

  it('returns exercise early when it already has an imageUrl (skips enrichment)', async () => {
    mockNormalizeCustomExercise.mockImplementationOnce(() => ({
      name: 'Curl', sets: 3, reps: 10, imageUrl: 'existing.png', muscleGroup: '', equipment: '',
    }));
    const customExercises = [{ exercise_name: 'Curl', sets: 3, reps: 10 }];
    mockSearchParams = new URLSearchParams('source=custom&id=1');
    sessionStorage.setItem('activeWorkoutExercises', JSON.stringify(customExercises));
    mockGetExercises.mockResolvedValue([
      { name: 'Curl', image_url: 'new.png', muscle_group: 'arms', equipment: 'dumbbell' },
    ]);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(mockGetExercises).toHaveBeenCalled());
    await waitFor(() => expect(result.current.exercises[0].name).toBe('Curl'));
    // imageUrl should NOT have been overwritten
    expect(result.current.exercises[0].imageUrl).toBe('existing.png');
  });

  it('uses fuzzy (substring) match when exact name match fails', async () => {
    const customExercises = [{ exercise_name: 'Bench', sets: 3, reps: 8 }];
    mockSearchParams = new URLSearchParams('source=custom&id=1');
    sessionStorage.setItem('activeWorkoutExercises', JSON.stringify(customExercises));
    // 'Bench' is a substring of 'Barbell Bench Press', triggering the fuzzy find
    mockGetExercises.mockResolvedValue([
      { name: 'Barbell Bench Press', image_url: 'bbp.png', muscle_group: 'chest', equipment: 'barbell' },
    ]);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(mockGetExercises).toHaveBeenCalled());
    await waitFor(() => expect(result.current.exercises[0].imageUrl).toBe('bbp.png'));
  });

  it('returns exercise unchanged when no library match is found', async () => {
    const customExercises = [{ exercise_name: 'Obscure Move XYZ', sets: 2, reps: 5 }];
    mockSearchParams = new URLSearchParams('source=custom&id=1');
    sessionStorage.setItem('activeWorkoutExercises', JSON.stringify(customExercises));
    mockGetExercises.mockResolvedValue([
      { name: 'Bench Press', image_url: 'bp.png', muscle_group: 'chest', equipment: 'barbell' },
    ]);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(mockGetExercises).toHaveBeenCalled());
    await waitFor(() => expect(result.current.exercises[0].name).toBe('Obscure Move XYZ'));
    expect(result.current.exercises[0].imageUrl).toBe('');
  });

  it('uses empty strings for imageUrl/muscleGroup/equipment when match has no those fields', async () => {
    const customExercises = [{ exercise_name: 'Lunge', sets: 3, reps: 12 }];
    mockSearchParams = new URLSearchParams('source=custom&id=1');
    sessionStorage.setItem('activeWorkoutExercises', JSON.stringify(customExercises));
    mockGetExercises.mockResolvedValue([{ name: 'Lunge' }]); // no image_url, muscle_group, equipment
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(mockGetExercises).toHaveBeenCalled());
    await waitFor(() => expect(result.current.exercises[0].name).toBe('Lunge'));
    expect(result.current.exercises[0].imageUrl).toBe('');
    expect(result.current.exercises[0].muscleGroup).toBe('');
    expect(result.current.exercises[0].equipment).toBe('');
  });

  it('silently ignores getExercises rejection during custom exercise enrichment', async () => {
    const customExercises = [{ exercise_name: 'Push Up', sets: 3, reps: 15 }];
    mockSearchParams = new URLSearchParams('source=custom&id=1');
    sessionStorage.setItem('activeWorkoutExercises', JSON.stringify(customExercises));
    mockGetExercises.mockRejectedValue(new Error('api error'));
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(mockGetExercises).toHaveBeenCalled());
    // No crash, exercise is still present
    expect(result.current.exercises[0].name).toBe('Push Up');
  });

  it('uses empty string fallback when a library item has no name property', async () => {
    const customExercises = [{ exercise_name: 'Push Up', sets: 3, reps: 15 }];
    mockSearchParams = new URLSearchParams('source=custom&id=1');
    sessionStorage.setItem('activeWorkoutExercises', JSON.stringify(customExercises));
    // Library item with no name — first find (item.name?.trim()) returns undefined ≠ 'push up'
    // second find: (item.name || '').trim() → '' fallback taken; nameLower.includes('') is true → matches
    mockGetExercises.mockResolvedValue([{ image_url: 'nameless.png', muscle_group: 'chest' }]);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(mockGetExercises).toHaveBeenCalled());
    await waitFor(() => expect(result.current.exercises[0].imageUrl).toBe('nameless.png'));
  });

  // -----------------------------------------------------------------------
  // finish() branch coverage
  // -----------------------------------------------------------------------

  it('finish uses done sets (doneLogs) when some sets are marked done', async () => {
    mockGetTemplateExercises.mockResolvedValue({
      exercises: [{ exercise_name: 'Squat', sets: 3, reps: 8 }],
    });
    mockLogWorkout.mockResolvedValue({});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Mark only the first set as done
    act(() => { result.current.handleSetUpdate(0, 0, 'done', true); });
    await act(async () => { await result.current.handleEnd(); });
    await waitFor(() => expect(mockLogWorkout).toHaveBeenCalled());
    const [payload] = mockLogWorkout.mock.calls[0];
    // doneLogs has 1 entry → sets should be 1
    expect(payload.exercises[0].sets).toBe(1);
    window.confirm.mockRestore?.();
  });

  it('finish uses ex.reps fallback when set reps field is empty string', async () => {
    mockGetTemplateExercises.mockResolvedValue({
      exercises: [{ exercise_name: 'Deadlift', sets: 1, reps: 5 }],
    });
    mockLogWorkout.mockResolvedValue({});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => useActiveWorkout(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Set reps to '' so Number('') === 0 (falsy) → falls back to ex.reps
    act(() => { result.current.handleSetUpdate(0, 0, 'reps', ''); });
    await act(async () => { await result.current.handleEnd(); });
    await waitFor(() => expect(mockLogWorkout).toHaveBeenCalled());
    const [payload] = mockLogWorkout.mock.calls[0];
    expect(payload.exercises[0].reps).toBe(5); // ex.reps fallback
    window.confirm.mockRestore?.();
  });
});
