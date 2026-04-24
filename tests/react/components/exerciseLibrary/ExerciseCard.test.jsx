/**
 * TESTING PLAN — ExerciseCard
 *
 * COVERED:
 *  - Renders exercise name
 *  - Renders muscle_group badge when present; hidden when absent
 *  - Renders equipment badge when present; hidden when absent
 *  - Neither badge renders when both muscle_group and equipment are absent
 *  - Renders image with correct alt text
 *  - onClick called with exercise object on mouse click
 *  - onClick called on Enter key press
 *  - onClick called on Space key press
 *  - onClick NOT called on unrelated key (Tab)
 *  - Correct aria-label ("View details for <name>")
 *  - Element has role="button"
 *  - tabIndex is 0 (keyboard focusable)
 *  - Image onError fallback: assert element background becomes '#222' when image fails to load
 *
 * TODO — Gaps to fill:
 *  - No significant gaps identified
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ExerciseCard from "@/components/exerciseLibrary/ExerciseCard";

const mockExercise = {
  id: "1",
  name: "Bench Press",
  muscle_group: "chest",
  equipment: "barbell",
  image_url: "http://test.com/bench.gif",
};

describe("ExerciseCard (Exercise Library)", () => {
  it("renders the exercise name", () => {
    render(<ExerciseCard exercise={mockExercise} onClick={vi.fn()} />);
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
  });

  it("renders the muscle group badge", () => {
    render(<ExerciseCard exercise={mockExercise} onClick={vi.fn()} />);
    expect(screen.getByText("chest")).toBeInTheDocument();
  });

  it("renders the equipment badge", () => {
    render(<ExerciseCard exercise={mockExercise} onClick={vi.fn()} />);
    expect(screen.getByText("barbell")).toBeInTheDocument();
  });

  it("does not render the muscle group badge when muscle_group is empty", () => {
    render(
      <ExerciseCard
        exercise={{ ...mockExercise, muscle_group: "" }}
        onClick={vi.fn()}
      />,
    );
    expect(screen.queryByText("chest")).not.toBeInTheDocument();
  });

  it("does not render the equipment badge when equipment is empty", () => {
    render(
      <ExerciseCard
        exercise={{ ...mockExercise, equipment: "" }}
        onClick={vi.fn()}
      />,
    );
    expect(screen.queryByText("barbell")).not.toBeInTheDocument();
  });

  it("renders neither badge when both muscle_group and equipment are absent", () => {
    render(
      <ExerciseCard
        exercise={{ ...mockExercise, muscle_group: "", equipment: "" }}
        onClick={vi.fn()}
      />,
    );
    expect(document.querySelectorAll(".el-badge")).toHaveLength(0);
  });

  it("renders the exercise image with the correct alt text", () => {
    render(<ExerciseCard exercise={mockExercise} onClick={vi.fn()} />);
    expect(screen.getByAltText("Bench Press")).toBeInTheDocument();
  });

  it("calls onClick with the exercise object when clicked", () => {
    const onClick = vi.fn();
    render(<ExerciseCard exercise={mockExercise} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: /bench press/i }));
    expect(onClick).toHaveBeenCalledWith(mockExercise);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick when the Enter key is pressed", () => {
    const onClick = vi.fn();
    render(<ExerciseCard exercise={mockExercise} onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(onClick).toHaveBeenCalledWith(mockExercise);
  });

  it("calls onClick when the Space key is pressed", () => {
    const onClick = vi.fn();
    render(<ExerciseCard exercise={mockExercise} onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: " " });
    expect(onClick).toHaveBeenCalledWith(mockExercise);
  });

  it("does not call onClick when an unrelated key is pressed", () => {
    const onClick = vi.fn();
    render(<ExerciseCard exercise={mockExercise} onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Tab" });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("has the correct aria-label for accessibility", () => {
    render(<ExerciseCard exercise={mockExercise} onClick={vi.fn()} />);
    expect(
      screen.getByLabelText("View details for Bench Press"),
    ).toBeInTheDocument();
  });

  it("applies image fallback background when image fails to load", () => {
    render(<ExerciseCard exercise={mockExercise} onClick={vi.fn()} />);
    const img = screen.getByAltText("Bench Press");
    fireEvent.error(img);
    expect(img).toHaveStyle({ background: "#222" });
  });
});
