/**
 * TESTING PLAN — ExerciseLibraryHero
 *
 * COVERED:
 *  - Renders the "Exercise Library" heading
 *  - Renders the subtitle text
 *
 * TODO — Gaps to fill:
 *  - Renders within a <header> or landmark element with correct semantic role
 *  - Heading is an h1 (or correct heading level)
 *  - Component renders without crashing when no props provided
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ExerciseLibraryHero from "@/components/exerciseLibrary/ExerciseLibraryHero";

describe("ExerciseLibraryHero", () => {
  it('renders the "Exercise Library" heading', () => {
    render(<ExerciseLibraryHero />);
    expect(
      screen.getByRole("heading", { name: "Exercise Library" }),
    ).toBeInTheDocument();
  });

  it("renders the subtitle text", () => {
    render(<ExerciseLibraryHero />);
    expect(
      screen.getByText(/comprehensive collection of exercises/i),
    ).toBeInTheDocument();
  });
});
