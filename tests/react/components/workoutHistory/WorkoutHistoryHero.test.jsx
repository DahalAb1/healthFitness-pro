import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WorkoutHistoryHero from '@/components/history/HistoryHero';

describe('HistoryHero', () => {
  it('renders the "History" heading', () => {
    render(<WorkoutHistoryHero />);
    expect(screen.getByRole('heading', { name: 'History' })).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<WorkoutHistoryHero />);
    expect(screen.getByText(/fitness journey at a glance/i)).toBeInTheDocument();
  });
});
