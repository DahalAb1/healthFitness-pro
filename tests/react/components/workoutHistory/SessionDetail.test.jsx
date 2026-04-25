import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import SessionDetail from '@/components/history/SessionDetail';

// Convenience wrapper with sensible defaults
function renderDetail(overrides = {}) {
  const defaults = {
    month: 3,        // April (0-indexed)
    year: 2026,
    selectedDay: null,
    loadingDetail: false,
    workout: null,
    mealLogs: [],
  };
  return render(<SessionDetail {...defaults} {...overrides} />);
}

describe('SessionDetail', () => {
  // -------------------------------------------------------------------------
  // No day selected
  // -------------------------------------------------------------------------
  describe('when no day is selected', () => {
    it('shows "Select a date" heading', () => {
      renderDetail();
      expect(screen.getByText('Select a date')).toBeInTheDocument();
    });

    it('shows the click-prompt placeholder', () => {
      renderDetail();
      expect(
        screen.getByText('Click a day to view workout and nutrition details.'),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Day selected – loading state
  // -------------------------------------------------------------------------
  describe('when a day is selected and data is loading', () => {
    it('displays the correct date heading', () => {
      renderDetail({ selectedDay: 15, loadingDetail: true });
      expect(screen.getByText('April 15, 2026')).toBeInTheDocument();
    });

    it('shows "Loading…" text', () => {
      renderDetail({ selectedDay: 15, loadingDetail: true });
      expect(screen.getByText('Loading…')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Day selected – no data
  // -------------------------------------------------------------------------
  describe('when a day is selected but no workout or nutrition exists', () => {
    it('shows the empty state message', () => {
      renderDetail({ selectedDay: 5 });
      expect(
        screen.getByText('No workout or nutrition logged for this date.'),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Day selected – workout data
  // -------------------------------------------------------------------------
  describe('when a workout is present', () => {
    const workout = {
      duration_minutes: 45,
      exercises: [
        { exercise_name: 'Bench Press', sets: 3, reps: 10, weight: 135 },
        { exercise_name: 'Squat', sets: 4, reps: 8, weight: 225 },
      ],
    };

    it('shows the workout duration', () => {
      renderDetail({ selectedDay: 10, workout });
      expect(screen.getByText('45 min')).toBeInTheDocument();
    });

    it('renders the exercise table with all exercises', () => {
      renderDetail({ selectedDay: 10, workout });
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Squat')).toBeInTheDocument();
    });

    it('renders the correct weight in lbs for each exercise', () => {
      renderDetail({ selectedDay: 10, workout });
      expect(screen.getByText('135 lbs')).toBeInTheDocument();
      expect(screen.getByText('225 lbs')).toBeInTheDocument();
    });

    it('shows exercise table headers', () => {
      renderDetail({ selectedDay: 10, workout });
      expect(screen.getByText('Exercise')).toBeInTheDocument();
      expect(screen.getByText('Sets')).toBeInTheDocument();
      expect(screen.getByText('Reps')).toBeInTheDocument();
      expect(screen.getByText('Weight')).toBeInTheDocument();
    });

    it('shows "No exercises logged" when workout has an empty exercises array', () => {
      renderDetail({ selectedDay: 10, workout: { duration_minutes: 20, exercises: [] } });
      expect(screen.getByText('No exercises logged for this session.')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Day selected – nutrition data
  // -------------------------------------------------------------------------
  describe('when meal logs are present', () => {
    const mealLogs = [
      { id: 1, meal_type: 'breakfast', food_name: 'Oatmeal', kcal: 300, protein_g: 10, carbs_g: 55, fat_g: 5 },
      { id: 2, meal_type: 'lunch',     food_name: 'Chicken',  kcal: 400, protein_g: 50, carbs_g: 20, fat_g: 8 },
    ];

    it('renders the Nutrition section', () => {
      renderDetail({ selectedDay: 3, mealLogs });
      expect(screen.getByText('Nutrition')).toBeInTheDocument();
    });

    it('shows food names', () => {
      renderDetail({ selectedDay: 3, mealLogs });
      expect(screen.getByText('Oatmeal')).toBeInTheDocument();
      expect(screen.getByText('Chicken')).toBeInTheDocument();
    });

    it('shows the meal type labels (capitalised)', () => {
      renderDetail({ selectedDay: 3, mealLogs });
      expect(screen.getByText('Breakfast')).toBeInTheDocument();
      expect(screen.getByText('Lunch')).toBeInTheDocument();
    });

    it('renders the total calorie count', () => {
      renderDetail({ selectedDay: 3, mealLogs });
      // Total is 700 kcal
      expect(screen.getByText(/700 Calories/)).toBeInTheDocument();
    });

    it('renders null-macro values as "—"', () => {
      const logsWithNulls = [
        { id: 3, meal_type: 'dinner', food_name: 'Mystery Food', kcal: 500, protein_g: null, carbs_g: null, fat_g: null },
      ];
      renderDetail({ selectedDay: 3, mealLogs: logsWithNulls });
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThanOrEqual(3);
    });

    it('silently ignores meal logs with an unrecognised meal_type', () => {
      const logsWithUnknownType = [
        { id: 10, meal_type: 'snack', food_name: 'Apple', kcal: 100, protein_g: 1, carbs_g: 20, fat_g: 0 },
      ];
      renderDetail({ selectedDay: 5, mealLogs: logsWithUnknownType });
      // NutritionSection renders because mealLogs.length > 0 – totals are computed
      expect(screen.getByText('Nutrition')).toBeInTheDocument();
      // but 'snack' is not a known meal_type, so no meal-section heading for it appears
      expect(screen.queryByText('Snack')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Date heading format
  // -------------------------------------------------------------------------
  describe('date heading', () => {
    it('uses the correct month name for each month index', () => {
      const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      MONTHS.forEach((name, idx) => {
        const { unmount } = renderDetail({ selectedDay: 1, month: idx, year: 2026 });
        expect(screen.getByText(`${name} 1, 2026`)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
