import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import FeaturesSection from '@/components/frontpage/FeaturesSection';

function renderSection() {
  return render(
    <MemoryRouter>
      <FeaturesSection />
    </MemoryRouter>,
  );
}

describe('FeaturesSection', () => {
  it('renders the Workout Templates feature heading', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: 'Workout Templates' })).toBeInTheDocument();
  });

  it('renders the Workout Tracking feature heading', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: 'Workout Tracking' })).toBeInTheDocument();
  });

  it('renders the Exercise Library feature heading', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: 'Exercise Library' })).toBeInTheDocument();
  });

  it('renders the Workout History feature heading', () => {
    renderSection();
    expect(screen.getByRole('heading', { name: 'Workout History' })).toBeInTheDocument();
  });

  it('renders 6 feature rows in total', () => {
    renderSection();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(6);
  });

  it('renders the "Browse Exercises" link pointing to /exercise-library', () => {
    renderSection();
    expect(screen.getByRole('link', { name: 'Browse Exercises' })).toHaveAttribute('href', '/exercise-library');
  });

  it('renders the "View History" link pointing to /workout-history', () => {
    renderSection();
    const links = screen.getAllByRole('link', { name: 'View History' });
    expect(links[0]).toHaveAttribute('href', '/workout-history');
  });

  it('renders section elements with the expected ids', () => {
    renderSection();
    expect(document.querySelector('#workout-templates')).toBeInTheDocument();
    expect(document.querySelector('#workout-tracking')).toBeInTheDocument();
    expect(document.querySelector('#library')).toBeInTheDocument();
    expect(document.querySelector('#workout-history')).toBeInTheDocument();
  });
});
