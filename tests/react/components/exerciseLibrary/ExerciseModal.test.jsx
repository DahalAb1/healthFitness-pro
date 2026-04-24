/**
 * TESTING PLAN — ExerciseModal
 *
 * COVERED:
 *  - Renders exercise name, muscle_group badge, equipment badge
 *  - String description renders as a single instruction item
 *  - Array description renders each item as a separate step
 *  - Empty string description shows fallback text
 *  - Undefined description shows fallback text
 *  - onClose called when close button is clicked
 *  - onClose called when overlay backdrop is clicked
 *  - onClose called when Escape key is pressed
 *  - onClose NOT called for non-Escape keys
 *  - role="dialog" present on modal root
 *  - aria-modal="true" present on modal root
 *  - document.body.style.overflow is set to 'hidden' on mount
 *  - document.body.style.overflow is restored to '' on unmount
 *  - keydown event listener is removed from document on unmount (no memory leak)
 *
 * TODO — Gaps to fill:
 *  - No significant gaps identified
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ExerciseModal from "@/components/exerciseLibrary/ExerciseModal";

const mockExercise = {
  name: "Squat",
  muscle_group: "thighs",
  equipment: "barbell",
  description: "Stand with feet shoulder-width apart.",
  image_url: "http://test.com/squat.gif",
};

describe("ExerciseModal", () => {
  it("renders the exercise name", () => {
    render(<ExerciseModal exercise={mockExercise} onClose={vi.fn()} />);
    expect(screen.getByText("Squat")).toBeInTheDocument();
  });

  it("renders the muscle group badge", () => {
    render(<ExerciseModal exercise={mockExercise} onClose={vi.fn()} />);
    expect(screen.getByText("thighs")).toBeInTheDocument();
  });

  it("renders the equipment badge", () => {
    render(<ExerciseModal exercise={mockExercise} onClose={vi.fn()} />);
    expect(screen.getByText("barbell")).toBeInTheDocument();
  });

  it("renders a string description as a single instruction item", () => {
    render(<ExerciseModal exercise={mockExercise} onClose={vi.fn()} />);
    expect(
      screen.getByText("Stand with feet shoulder-width apart."),
    ).toBeInTheDocument();
  });

  it("renders an array description as multiple instruction items", () => {
    const ex = { ...mockExercise, description: ["Step 1", "Step 2", "Step 3"] };
    render(<ExerciseModal exercise={ex} onClose={vi.fn()} />);
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });

  it("shows a fallback message when description is an empty string", () => {
    const ex = { ...mockExercise, description: "" };
    render(<ExerciseModal exercise={ex} onClose={vi.fn()} />);
    expect(
      screen.getByText("No instructions available for this exercise."),
    ).toBeInTheDocument();
  });

  it("shows a fallback message when description is absent", () => {
    const ex = { ...mockExercise, description: undefined };
    render(<ExerciseModal exercise={ex} onClose={vi.fn()} />);
    expect(
      screen.getByText("No instructions available for this exercise."),
    ).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<ExerciseModal exercise={mockExercise} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close exercise detail"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the overlay backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<ExerciseModal exercise={mockExercise} onClose={onClose} />);
    fireEvent.click(document.querySelector(".el-modal-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the Escape key is pressed", () => {
    const onClose = vi.fn();
    render(<ExerciseModal exercise={mockExercise} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose for non-Escape key presses", () => {
    const onClose = vi.fn();
    render(<ExerciseModal exercise={mockExercise} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('has role="dialog" on the modal root for accessibility', () => {
    render(<ExerciseModal exercise={mockExercise} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it('has aria-modal="true"', () => {
    render(<ExerciseModal exercise={mockExercise} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("sets body overflow to hidden on mount and restores it on unmount", () => {
    const { unmount } = render(
      <ExerciseModal exercise={mockExercise} onClose={vi.fn()} />,
    );
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("removes the keydown listener on unmount", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = render(
      <ExerciseModal exercise={mockExercise} onClose={vi.fn()} />,
    );

    const keydownHandler = addSpy.mock.calls.find(
      ([eventName]) => eventName === "keydown",
    )?.[1];

    expect(typeof keydownHandler).toBe("function");

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("keydown", keydownHandler);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
