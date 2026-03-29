import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams('source=template&id=1');
const mockGetTemplateExercises = vi.fn();
const mockGetExercises = vi.fn();
const mockLogWorkout = vi.fn();
let mockToken = 'test-token';

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
  normalizeCustomExercise: (ex) => ({
    name: ex.exercise_name || ex.name || '',
    sets: ex.sets || 3,
    reps: ex.reps || 10,
    imageUrl: '',
    muscleGroup: '',
    equipment: '',
  }),
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
});
