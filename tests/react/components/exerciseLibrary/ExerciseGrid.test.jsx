/**
 * TESTING PLAN — ExerciseGrid
 *
 * COVERED:
 *  - Shows loading spinner/text when loading=true
 *  - Does NOT render exercise cards while loading
 *  - Shows empty-state message when exercises=[]
 *  - Shows empty-state message when exercises=null
 *  - Renders a card for each exercise in the list
 *  - Loading text absent when exercises are rendered
 *  - Empty-state message absent when exercises are rendered
 *  - onSelectExercise is called with the selected exercise when a card is clicked
 *
 * TODO — Gaps to fill:
 *  - No significant gaps identified
 */

import { render, screen, fireEvent } from "@testing-library/react";

import { describe, it, expect, vi } from "vitest";
import ExerciseGrid from "@/components/exerciseLibrary/ExerciseGrid";

const mockExercises = [
  {
    id: "1",
    name: "Bench Press",
    muscle_group: "chest",
    equipment: "barbell",
    image_url: "http://test.com/bench.gif",
  },
  {
    id: "2",
    name: "Squat",
    muscle_group: "thighs",
    equipment: "barbell",
    image_url: "http://test.com/squat.gif",
  },
  {
    id: "3",
    name: "Pull Up",
    muscle_group: "back",
    equipment: "body weight",
    image_url: "http://test.com/pullup.gif",
  },
];

describe("ExerciseGrid", () => {
  it("renders the loading spinner when loading is true", () => {
    render(
      <ExerciseGrid exercises={[]} loading={true} onSelectExercise={vi.fn()} />,
    );
    expect(screen.getByText("Loading exercises...")).toBeInTheDocument();
  });

  it("does not render the grid when loading", () => {
    render(
      <ExerciseGrid
        exercises={mockExercises}
        loading={true}
        onSelectExercise={vi.fn()}
      />,
    );
    expect(screen.queryByText("Bench Press")).not.toBeInTheDocument();
  });

  it("renders the empty-state message when exercises array is empty", () => {
    render(
      <ExerciseGrid
        exercises={[]}
        loading={false}
        onSelectExercise={vi.fn()}
      />,
    );
    expect(screen.getByText(/no exercises found/i)).toBeInTheDocument();
  });

  it("renders the empty-state message when exercises is null", () => {
    render(
      <ExerciseGrid
        exercises={null}
        loading={false}
        onSelectExercise={vi.fn()}
      />,
    );
    expect(screen.getByText(/no exercises found/i)).toBeInTheDocument();
  });

  it("renders a card for each exercise in the list", () => {
    render(
      <ExerciseGrid
        exercises={mockExercises}
        loading={false}
        onSelectExercise={vi.fn()}
      />,
    );
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Squat")).toBeInTheDocument();
    expect(screen.getByText("Pull Up")).toBeInTheDocument();
  });

  it("does not show the loading text when exercises are rendered", () => {
    render(
      <ExerciseGrid
        exercises={mockExercises}
        loading={false}
        onSelectExercise={vi.fn()}
      />,
    );
    expect(screen.queryByText("Loading exercises...")).not.toBeInTheDocument();
  });

  it("does not show the empty-state message when exercises are rendered", () => {
    render(
      <ExerciseGrid
        exercises={mockExercises}
        loading={false}
        onSelectExercise={vi.fn()}
      />,
    );
    expect(screen.queryByText(/no exercises found/i)).not.toBeInTheDocument();
  });

  it("calls onSelectExercise with the clicked exercise", () => {
    const onSelectExercise = vi.fn();
    render(
      <ExerciseGrid
        exercises={mockExercises}
        loading={false}
        onSelectExercise={onSelectExercise}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /view details for bench press/i }),
    );
    expect(onSelectExercise).toHaveBeenCalledWith(mockExercises[0]);
    expect(onSelectExercise).toHaveBeenCalledTimes(1);
  });
});
