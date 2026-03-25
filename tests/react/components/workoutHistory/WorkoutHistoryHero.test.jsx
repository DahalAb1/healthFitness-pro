import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WorkoutHistoryHero from '@/components/workoutHistory/WorkoutHistoryHero';

describe('WorkoutHistoryHero', () => {
  it('renders the "Workout History" heading', () => {
    render(<WorkoutHistoryHero />);
    expect(screen.getByRole('heading', { name: 'Workout History' })).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<WorkoutHistoryHero />);
    expect(screen.getByText(/fitness journey at a glance/i)).toBeInTheDocument();
  });
});
