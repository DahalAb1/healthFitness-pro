import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/components/common/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('@/components/common/Footer', () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock('@/components/workoutHistory/WorkoutHistoryHero', () => ({
  default: () => <div data-testid="history-hero" />,
}));
vi.mock('@/components/workoutHistory/WorkoutCalendar', () => ({
  default: () => <div data-testid="calendar" />,
}));
vi.mock('@/components/workoutHistory/PerformanceTrends', () => ({
  default: () => <div data-testid="performance-trends" />,
}));

import WorkoutHistoryPage from '@/pages/WorkoutHistoryPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <WorkoutHistoryPage />
    </MemoryRouter>,
  );
}

describe('WorkoutHistoryPage', () => {
  it('renders Navbar', () => {
    renderPage();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders Footer', () => {
    renderPage();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders WorkoutHistoryHero', () => {
    renderPage();
    expect(screen.getByTestId('history-hero')).toBeInTheDocument();
  });

  it('renders WorkoutCalendar', () => {
    renderPage();
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('renders PerformanceTrends', () => {
    renderPage();
    expect(screen.getByTestId('performance-trends')).toBeInTheDocument();
  });
});
