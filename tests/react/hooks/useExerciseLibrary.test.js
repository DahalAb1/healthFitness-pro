/**
 * TESTING PLAN — useExerciseLibrary
 *
 * COVERED:
 *  - Initial state: activeFilter="ALL", exercises=[], loading=true, error=null, selectedExercise=null
 *  - Fetches with "ALL" filter on mount
 *  - loading becomes false after fetch completes
 *  - exercises populated after successful fetch
 *  - Changing activeFilter re-fetches with the new filter value
 *  - error is set when getExercises rejects
 *  - error is cleared on subsequent successful fetch after failure
 *  - setSelectedExercise updates selectedExercise
 *  - setSelectedExercise(null) clears selectedExercise back to null
 *
 * TODO — Gaps to fill:
 *  - No significant gaps identified; all major state transitions are covered
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetExercises = vi.fn();

vi.mock("@/utils/api", () => ({
  getExercises: (...args) => mockGetExercises(...args),
}));

import { useExerciseLibrary } from "@/hooks/useExerciseLibrary";

const SAMPLE_EXERCISES = [
  { id: 1, name: "Bench Press", muscle_group: "CHEST" },
  { id: 2, name: "Squat", muscle_group: "LEGS" },
];

describe("useExerciseLibrary", () => {
  beforeEach(() => {
    mockGetExercises.mockReset();
  });

  it('initialises with activeFilter="ALL", no exercises, loading=true, no error', () => {
    mockGetExercises.mockResolvedValue([]);
    const { result } = renderHook(() => useExerciseLibrary());
    expect(result.current.activeFilter).toBe("ALL");
    expect(result.current.exercises).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.selectedExercise).toBeNull();
  });

  it('fetches exercises for the "ALL" filter on mount', async () => {
    mockGetExercises.mockResolvedValue(SAMPLE_EXERCISES);
    const { result } = renderHook(() => useExerciseLibrary());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetExercises).toHaveBeenCalledWith("ALL");
    expect(result.current.exercises).toEqual(SAMPLE_EXERCISES);
  });

  it("sets loading=false after fetch completes", async () => {
    mockGetExercises.mockResolvedValue(SAMPLE_EXERCISES);
    const { result } = renderHook(() => useExerciseLibrary());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.loading).toBe(false);
  });

  it("setting activeFilter re-fetches with new filter", async () => {
    mockGetExercises.mockResolvedValue(SAMPLE_EXERCISES);
    const { result } = renderHook(() => useExerciseLibrary());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockGetExercises.mockResolvedValue([SAMPLE_EXERCISES[0]]);
    act(() => {
      result.current.setActiveFilter("CHEST");
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockGetExercises).toHaveBeenCalledWith("CHEST");
    expect(result.current.activeFilter).toBe("CHEST");
  });

  it("sets error message when getExercises rejects", async () => {
    mockGetExercises.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useExerciseLibrary());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.exercises).toEqual([]);
  });

  it("clears error on a new filter change that succeeds", async () => {
    mockGetExercises.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useExerciseLibrary());
    await waitFor(() => expect(result.current.error).toBeTruthy());

    mockGetExercises.mockResolvedValue(SAMPLE_EXERCISES);
    act(() => {
      result.current.setActiveFilter("LEGS");
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.exercises).toEqual(SAMPLE_EXERCISES);
  });

  it("setSelectedExercise updates selectedExercise", async () => {
    mockGetExercises.mockResolvedValue(SAMPLE_EXERCISES);
    const { result } = renderHook(() => useExerciseLibrary());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.setSelectedExercise(SAMPLE_EXERCISES[0]);
    });
    expect(result.current.selectedExercise).toEqual(SAMPLE_EXERCISES[0]);
  });

  it("setSelectedExercise can clear the selection", async () => {
    mockGetExercises.mockResolvedValue(SAMPLE_EXERCISES);
    const { result } = renderHook(() => useExerciseLibrary());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      result.current.setSelectedExercise(SAMPLE_EXERCISES[0]);
    });
    act(() => {
      result.current.setSelectedExercise(null);
    });
    expect(result.current.selectedExercise).toBeNull();
  });
});
