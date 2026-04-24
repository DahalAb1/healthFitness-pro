/**
 * TESTING PLAN — ExerciseLibraryHero
 *
 * COVERED:
 *  - Renders the "Exercise Library" heading
 *  - Renders the subtitle text
 *  - Renders in a semantic section container
 *  - Heading is h1
 *  - Renders without crashing with no props
 *
 * TODO — Gaps to fill:
 *  - No significant gaps identified
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

  it("renders in a semantic section container", () => {
    const { container } = render(<ExerciseLibraryHero />);
    expect(container.querySelector("section.el-hero")).toBeInTheDocument();
  });

  it("uses h1 for the main heading", () => {
    render(<ExerciseLibraryHero />);
    const heading = screen.getByRole("heading", { name: "Exercise Library" });
    expect(heading.tagName).toBe("H1");
  });

  it("renders without crashing when no props are passed", () => {
    render(<ExerciseLibraryHero />);
    expect(screen.getByRole("heading", { name: "Exercise Library" })).toBeInTheDocument();
  });
});
