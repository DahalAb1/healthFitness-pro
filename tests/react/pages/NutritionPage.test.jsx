import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/components/common/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('@/components/common/Footer', () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock('@/components/nutritionHub/NutritionHub', () => ({
  default: () => <div data-testid="nutrition-hub" />,
}));

import NutritionPage from '@/pages/NutritionPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <NutritionPage />
    </MemoryRouter>,
  );
}

describe('NutritionPage', () => {
  it('renders Navbar', () => {
    renderPage();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders Footer', () => {
    renderPage();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders NutritionHub', () => {
    renderPage();
    expect(screen.getByTestId('nutrition-hub')).toBeInTheDocument();
  });
});
