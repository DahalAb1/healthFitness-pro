/**
 * TESTING PLAN — ExerciseLibraryPage
 *
 * COVERED:
 *  - Navbar and Footer render
 *  - Loading spinner shown initially
 *  - Exercises displayed after API resolves
 *  - getExercises("ALL") called on mount
 *  - getExercises called again with new filter when filter button clicked
 *  - Error message shown when API rejects
 *  - Modal opens when an exercise card is clicked
 *  - Modal closes when the close button is clicked
 *  - Modal closes when Escape key is pressed
 *  - Modal closes when the overlay backdrop is clicked
 *  - "No exercises found" empty-state renders when API resolves with []
 *
 * TODO — Gaps to fill:
 *  - No significant gaps identified
 */

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/components/common/Navbar", () => ({
  default: () => <nav data-testid="navbar" />,
}));
vi.mock("@/components/common/Footer", () => ({
  default: () => <footer data-testid="footer" />,
}));
vi.mock("@/components/exerciseLibrary/ExerciseLibraryHero", () => ({
  default: () => <div data-testid="hero" />,
}));
vi.mock("@/utils/api", () => ({
  getExercises: vi.fn(),
}));

import ExerciseLibraryPage from "@/pages/ExerciseLibraryPage";
import { getExercises } from "@/utils/api";

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
];

function renderPage() {
  return render(
    <MemoryRouter>
      <ExerciseLibraryPage />
    </MemoryRouter>,
  );
}

describe("ExerciseLibraryPage", () => {
  beforeEach(() => {
    getExercises.mockResolvedValue(mockExercises);
  });

  it("renders the Navbar and Footer", async () => {
    getExercises.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("shows a loading spinner initially", () => {
    getExercises.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText("Loading exercises...")).toBeInTheDocument();
  });

  it("renders exercises after the API resolves", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Bench Press")).toBeInTheDocument(),
    );
    expect(screen.getByText("Squat")).toBeInTheDocument();
  });

  it('calls getExercises with "ALL" on mount', async () => {
    renderPage();
    await waitFor(() => expect(getExercises).toHaveBeenCalledWith("ALL"));
  });

  it("calls getExercises again when a filter is clicked", async () => {
    getExercises.mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(
        screen.queryByText("Loading exercises..."),
      ).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "CHEST" }));
    await waitFor(() => expect(getExercises).toHaveBeenCalledWith("CHEST"));
  });

  it("shows an error message when the API rejects", async () => {
    getExercises.mockRejectedValue(new Error("network"));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/failed to load exercises/i)).toBeInTheDocument(),
    );
  });

  it("opens the modal when an exercise card is clicked", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Bench Press")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("View details for Bench Press"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes the modal when the close button is clicked", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Bench Press")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("View details for Bench Press"));
    fireEvent.click(screen.getByLabelText("Close exercise detail"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the modal when Escape is pressed", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Bench Press")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("View details for Bench Press"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the modal when the overlay is clicked", async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Bench Press")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("View details for Bench Press"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(document.querySelector(".el-modal-overlay"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it('shows "No exercises found" when the API returns an empty list', async () => {
    getExercises.mockResolvedValue([]);
    renderPage();

    await waitFor(() =>
      expect(screen.getByText(/no exercises found/i)).toBeInTheDocument(),
    );
  });
});
