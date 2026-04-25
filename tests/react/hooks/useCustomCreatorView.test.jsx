import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockGetUserWorkouts = vi.fn();
const mockPostUserWorkout = vi.fn();
const mockDeleteUserWorkout = vi.fn();
const mockGetExercises = vi.fn();
let mockToken = 'test-token';
let mockUser = { id: 1 };

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ token: mockToken, user: mockUser }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/utils/api', () => ({
  getUserWorkouts: (...args) => mockGetUserWorkouts(...args),
  postUserWorkout: (...args) => mockPostUserWorkout(...args),
  deleteUserWorkout: (...args) => mockDeleteUserWorkout(...args),
  getExercises: (...args) => mockGetExercises(...args),
}));

// crypto.randomUUID may not be available in jsdom — polyfill if needed
if (!globalThis.crypto?.randomUUID) {
  let counter = 0;
  globalThis.crypto = { ...globalThis.crypto, randomUUID: () => `uuid-${++counter}` };
}

import { useCustomCreatorView } from '@/hooks/useCustomCreatorView';

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

const SAVED_WORKOUT = {
  id: 42,
  name: 'My Workout',
  exercises: [
    { exercise_id: 1, exercise_name: 'Bench Press', sets: 3, reps: 8 },
  ],
};

describe('useCustomCreatorView', () => {
  beforeEach(() => {
    mockToken = 'test-token';
    mockUser = { id: 1 };
    mockNavigate.mockReset();
    mockGetUserWorkouts.mockReset();
    mockPostUserWorkout.mockReset();
    mockDeleteUserWorkout.mockReset();
    mockGetExercises.mockReset();
    mockGetUserWorkouts.mockResolvedValue([]);
    mockGetExercises.mockResolvedValue([]);
  });

  it('initialises with one empty row and empty state', async () => {
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    expect(result.current.workoutName).toBe('');
    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0].exercise).toBe('');
    expect(result.current.rows[0].sets).toBe(3);
    expect(result.current.rows[0].reps).toBe(10);
    expect(result.current.savedWorkouts).toEqual([]);
    expect(result.current.showLibrary).toBe(false);
  });

  it('updateRow updates a specific field on the matching row', async () => {
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    const rowId = result.current.rows[0].id;
    act(() => { result.current.updateRow(rowId, 'exercise', 'Squat'); });
    expect(result.current.rows[0].exercise).toBe('Squat');
  });

  it('updateRow updates sets and reps independently', async () => {
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    const rowId = result.current.rows[0].id;
    act(() => {
      result.current.updateRow(rowId, 'sets', 5);
      result.current.updateRow(rowId, 'reps', 12);
    });
    expect(result.current.rows[0].sets).toBe(5);
    expect(result.current.rows[0].reps).toBe(12);
  });

  it('addExerciseFromLibrary appends a new row and closes the library', async () => {
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.setShowLibrary(true); });
    act(() => {
      result.current.addExerciseFromLibrary({ id: 5, name: 'Deadlift' });
    });
    expect(result.current.rows).toHaveLength(2);
    expect(result.current.rows[1].exercise).toBe('Deadlift');
    expect(result.current.rows[1].exerciseId).toBe(5);
    expect(result.current.showLibrary).toBe(false);
  });

  it('removeRow removes a row by id', async () => {
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    // Add a second row first
    act(() => { result.current.addExerciseFromLibrary({ id: 1, name: 'Curl' }); });
    expect(result.current.rows).toHaveLength(2);
    const idToRemove = result.current.rows[0].id;
    act(() => { result.current.removeRow(idToRemove); });
    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0].exercise).toBe('Curl');
  });

  it('removeRow does not remove the last row', async () => {
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    expect(result.current.rows).toHaveLength(1);
    const rowId = result.current.rows[0].id;
    act(() => { result.current.removeRow(rowId); });
    expect(result.current.rows).toHaveLength(1);
  });

  it('saveWorkout calls postUserWorkout and appends to savedWorkouts', async () => {
    mockPostUserWorkout.mockResolvedValue(SAVED_WORKOUT);
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => {
      result.current.setWorkoutName('My Workout');
      result.current.updateRow(result.current.rows[0].id, 'exercise', 'Bench Press');
    });
    await act(async () => { await result.current.saveWorkout(); });
    await waitFor(() => expect(result.current.savedWorkouts).toHaveLength(1));
    expect(mockPostUserWorkout).toHaveBeenCalled();
    expect(result.current.savedWorkouts[0]).toEqual(SAVED_WORKOUT);
  });

  it('saveWorkout resets workoutName and rows after saving', async () => {
    mockPostUserWorkout.mockResolvedValue(SAVED_WORKOUT);
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.setWorkoutName('My Workout'); });
    await act(async () => { await result.current.saveWorkout(); });
    expect(result.current.workoutName).toBe('');
    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0].exercise).toBe('');
  });

  it('saveWorkout shows alert and does not call API when name is empty', async () => {
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.saveWorkout(); });
    expect(mockAlert).toHaveBeenCalled();
    expect(mockPostUserWorkout).not.toHaveBeenCalled();
    mockAlert.mockRestore();
  });

  it('handleDelete removes a workout from savedWorkouts', async () => {
    mockDeleteUserWorkout.mockResolvedValue(undefined);
    mockGetUserWorkouts.mockResolvedValue([SAVED_WORKOUT]);
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(result.current.savedWorkouts).toHaveLength(1));
    await act(async () => { await result.current.handleDelete(SAVED_WORKOUT); });
    await waitFor(() => expect(result.current.savedWorkouts).toHaveLength(0));
    expect(mockDeleteUserWorkout).toHaveBeenCalledWith(42, 'test-token');
  });

  it('handleCustomize fills workoutName and rows from an existing workout', async () => {
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.handleCustomize(SAVED_WORKOUT); });
    expect(result.current.workoutName).toBe('My Workout');
    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0].exercise).toBe('Bench Press');
    expect(result.current.rows[0].sets).toBe(3);
    expect(result.current.rows[0].reps).toBe(8);
  });

  it('handleBegin sets sessionStorage and navigates to active-workout', async () => {
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.handleBegin(SAVED_WORKOUT); });
    expect(sessionStorage.getItem('activeWorkoutName')).toBe('My Workout');
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/active-workout?source=custom&id=42')
    );
  });

  it('toggleExpanded adds id to expandedIds on first call', async () => {
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.toggleExpanded(42); });
    expect(result.current.expandedIds.has(42)).toBe(true);
  });

  it('toggleExpanded removes id from expandedIds on second call', async () => {
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.toggleExpanded(42); });
    act(() => { result.current.toggleExpanded(42); });
    expect(result.current.expandedIds.has(42)).toBe(false);
  });

  it('loads library exercises when showLibrary is set to true', async () => {
    const libraryItems = [{ id: 1, name: 'Squat' }];
    mockGetExercises.mockResolvedValue(libraryItems);
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.setShowLibrary(true); });
    await waitFor(() => expect(result.current.libraryLoading).toBe(false));
    expect(mockGetExercises).toHaveBeenCalledWith('ALL');
    expect(result.current.filteredLibrary).toEqual(libraryItems);
  });

  it('filteredLibrary filters by librarySearch', async () => {
    mockGetExercises.mockResolvedValue([
      { id: 1, name: 'Squat' },
      { id: 2, name: 'Bench Press' },
    ]);
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.setShowLibrary(true); });
    await waitFor(() => expect(result.current.libraryLoading).toBe(false));
    act(() => { result.current.setLibrarySearch('bench'); });
    expect(result.current.filteredLibrary).toHaveLength(1);
    expect(result.current.filteredLibrary[0].name).toBe('Bench Press');
  });

  it('loads savedWorkouts on mount from getUserWorkouts', async () => {
    mockGetUserWorkouts.mockResolvedValue([SAVED_WORKOUT]);
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(result.current.savedWorkouts).toHaveLength(1));
    expect(result.current.savedWorkouts[0]).toEqual(SAVED_WORKOUT);
  });

  // -----------------------------------------------------------------------
  // Branch coverage additions
  // -----------------------------------------------------------------------

  it('handleCustomize falls back to empty strings/defaults when exercise fields are missing', async () => {
    const workout = { name: '', exercises: [{ exercise_id: undefined, exercise_name: undefined, sets: undefined, reps: undefined }] };
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.handleCustomize(workout); });
    expect(result.current.workoutName).toBe('');
    expect(result.current.rows[0].exerciseId).toBeNull();
    expect(result.current.rows[0].exercise).toBe('');
    expect(result.current.rows[0].sets).toBe(3);
    expect(result.current.rows[0].reps).toBe(10);
  });

  it('handleCustomize falls back to empty array when workout.exercises is missing', async () => {
    const workout = { name: 'No Exercises' };
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.handleCustomize(workout); });
    expect(result.current.workoutName).toBe('No Exercises');
    expect(result.current.rows).toEqual([]);
  });

  it('handleBegin falls back when workout has no name or exercises', async () => {
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.handleBegin({ id: 99 }); });
    expect(sessionStorage.getItem('activeWorkoutName')).toBe('Custom Workout');
    expect(sessionStorage.getItem('activeWorkoutExercises')).toBe('[]');
    expect(mockNavigate).toHaveBeenCalledWith('/active-workout?source=custom&id=99');
  });

  it('addExerciseFromLibrary falls back when exercise has no id or name', async () => {
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.addExerciseFromLibrary({}); });
    expect(result.current.rows).toHaveLength(2);
    expect(result.current.rows[1].exerciseId).toBeNull();
    expect(result.current.rows[1].exercise).toBe('');
  });

  it('updateRow returns unchanged row when id does not match', async () => {
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    const originalRow = result.current.rows[0];
    act(() => { result.current.updateRow('nonexistent-id', 'exercise', 'Squat'); });
    expect(result.current.rows[0]).toEqual(originalRow);
  });

  it('does not call getUserWorkouts when token is null', async () => {
    mockToken = null;
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    // Wait a tick for useEffect to run
    await act(async () => {});
    expect(mockGetUserWorkouts).not.toHaveBeenCalled();
  });

  it('falls back to empty array when getUserWorkouts returns non-array', async () => {
    mockGetUserWorkouts.mockResolvedValue(null);
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    await waitFor(() => expect(result.current.savedWorkouts).toEqual([]));
  });

  it('falls back to empty array when getExercises returns non-array', async () => {
    mockGetExercises.mockResolvedValue(null);
    const { result } = renderHook(() => useCustomCreatorView(), { wrapper });
    await waitFor(() => expect(mockGetUserWorkouts).toHaveBeenCalled());
    act(() => { result.current.setShowLibrary(true); });
    await waitFor(() => expect(result.current.libraryLoading).toBe(false));
    expect(result.current.filteredLibrary).toEqual([]);
  });
});
