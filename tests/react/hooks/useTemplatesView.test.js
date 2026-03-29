import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetTemplates = vi.fn();
const mockGetTemplateExercises = vi.fn();

vi.mock('@/utils/api', () => ({
  getTemplates: (...args) => mockGetTemplates(...args),
  getTemplateExercises: (...args) => mockGetTemplateExercises(...args),
}));

import { useTemplatesView } from '@/hooks/useTemplatesView';

const SAMPLE_TEMPLATES = [
  { id: 1, name: 'Push Day' },
  { id: 2, name: 'Pull Day' },
];

const SAMPLE_EXERCISES = {
  exercises: [
    { id: 10, exercise_name: 'Bench Press', sets: 3, reps: 8 },
    { id: 11, exercise_name: 'Incline Press', sets: 3, reps: 10 },
  ],
};

describe('useTemplatesView', () => {
  beforeEach(() => {
    mockGetTemplates.mockReset();
    mockGetTemplateExercises.mockReset();
  });

  it('initialises with empty state', () => {
    mockGetTemplates.mockResolvedValue([]);
    const { result } = renderHook(() => useTemplatesView());
    expect(result.current.templates).toEqual([]);
    expect(result.current.selectedTemplate).toBeNull();
    expect(result.current.exercises).toEqual([]);
    expect(result.current.loadingExercises).toBe(false);
  });

  it('loads templates on mount', async () => {
    mockGetTemplates.mockResolvedValue(SAMPLE_TEMPLATES);
    const { result } = renderHook(() => useTemplatesView());
    await waitFor(() => expect(result.current.templates).toHaveLength(2));
    expect(result.current.templates).toEqual(SAMPLE_TEMPLATES);
  });

  it('handles non-array response from getTemplates gracefully', async () => {
    mockGetTemplates.mockResolvedValue(null);
    const { result } = renderHook(() => useTemplatesView());
    await waitFor(() => expect(mockGetTemplates).toHaveBeenCalled());
    expect(result.current.templates).toEqual([]);
  });

  it('openTemplate sets selectedTemplate and loads its exercises', async () => {
    mockGetTemplates.mockResolvedValue(SAMPLE_TEMPLATES);
    mockGetTemplateExercises.mockResolvedValue(SAMPLE_EXERCISES);
    const { result } = renderHook(() => useTemplatesView());
    await waitFor(() => expect(result.current.templates).toHaveLength(2));

    await act(async () => { result.current.openTemplate(SAMPLE_TEMPLATES[0]); });
    await waitFor(() => expect(result.current.loadingExercises).toBe(false));

    expect(result.current.selectedTemplate).toEqual(SAMPLE_TEMPLATES[0]);
    expect(result.current.exercises).toEqual(SAMPLE_EXERCISES.exercises);
    expect(mockGetTemplateExercises).toHaveBeenCalledWith(1);
  });

  it('openTemplate sets loadingExercises to true then false', async () => {
    mockGetTemplates.mockResolvedValue(SAMPLE_TEMPLATES);
    let resolveExercises;
    mockGetTemplateExercises.mockReturnValue(
      new Promise((res) => { resolveExercises = res; })
    );
    const { result } = renderHook(() => useTemplatesView());
    await waitFor(() => expect(result.current.templates).toHaveLength(2));

    act(() => { result.current.openTemplate(SAMPLE_TEMPLATES[0]); });
    expect(result.current.loadingExercises).toBe(true);

    await act(async () => { resolveExercises(SAMPLE_EXERCISES); });
    expect(result.current.loadingExercises).toBe(false);
  });

  it('openTemplate clears previous exercises before loading new ones', async () => {
    mockGetTemplates.mockResolvedValue(SAMPLE_TEMPLATES);
    mockGetTemplateExercises.mockResolvedValue(SAMPLE_EXERCISES);
    const { result } = renderHook(() => useTemplatesView());
    await waitFor(() => expect(result.current.templates).toHaveLength(2));

    await act(async () => { result.current.openTemplate(SAMPLE_TEMPLATES[0]); });
    await waitFor(() => expect(result.current.exercises.length).toBeGreaterThan(0));

    // Open another template — exercises should clear first
    mockGetTemplateExercises.mockResolvedValue({ exercises: [] });
    act(() => { result.current.openTemplate(SAMPLE_TEMPLATES[1]); });
    // While loading, exercises should be cleared
    expect(result.current.exercises).toEqual([]);
  });

  it('closeTemplate clears selectedTemplate', async () => {
    mockGetTemplates.mockResolvedValue(SAMPLE_TEMPLATES);
    mockGetTemplateExercises.mockResolvedValue(SAMPLE_EXERCISES);
    const { result } = renderHook(() => useTemplatesView());
    await waitFor(() => expect(result.current.templates).toHaveLength(2));
    await act(async () => { result.current.openTemplate(SAMPLE_TEMPLATES[0]); });
    await waitFor(() => expect(result.current.selectedTemplate).not.toBeNull());

    act(() => { result.current.closeTemplate(); });
    expect(result.current.selectedTemplate).toBeNull();
  });
});
