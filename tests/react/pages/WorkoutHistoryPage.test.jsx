import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/components/common/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('@/components/common/Footer', () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock('@/components/history/HistoryHero', () => ({
  default: () => <div data-testid="history-hero" />,
}));
vi.mock('@/components/history/Calendar', () => ({
  default: () => <div data-testid="calendar" />,
}));
vi.mock('@/components/history/PerformanceTrends', () => ({
  default: () => <div data-testid="performance-trends" />,
}));
vi.mock('@/components/history/NutritionTrends', () => ({
  default: () => <div data-testid="nutrition-trends" />,
}));

import HistoryPage from '@/pages/HistoryPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <HistoryPage />
    </MemoryRouter>,
  );
}

describe('HistoryPage', () => {
  it('renders Navbar', () => {
    renderPage();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders Footer', () => {
    renderPage();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders HistoryHero', () => {
    renderPage();
    expect(screen.getByTestId('history-hero')).toBeInTheDocument();
  });

  it('renders Calendar', () => {
    renderPage();
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('renders PerformanceTrends', () => {
    renderPage();
    expect(screen.getByTestId('performance-trends')).toBeInTheDocument();
  });
});
