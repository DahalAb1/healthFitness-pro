import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Stub all child components so the page test stays focused
vi.mock('@/components/common/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('@/components/common/Footer', () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock('@/components/frontpage/HeroSlideshow', () => ({ default: () => <div data-testid="hero-slideshow" /> }));
vi.mock('@/components/frontpage/MissionSection', () => ({ default: () => <div data-testid="mission-section" /> }));
vi.mock('@/components/frontpage/TestimonialsSection', () => ({ default: () => <div data-testid="testimonials-section" /> }));
vi.mock('@/components/frontpage/FeaturesSection', () => ({ default: () => <div data-testid="features-section" /> }));

import FrontPage from '@/pages/FrontPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <FrontPage />
    </MemoryRouter>,
  );
}

describe('FrontPage', () => {
  it('renders the Navbar', () => {
    renderPage();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders the Footer', () => {
    renderPage();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders the HeroSlideshow', () => {
    renderPage();
    expect(screen.getByTestId('hero-slideshow')).toBeInTheDocument();
  });

  it('renders the MissionSection', () => {
    renderPage();
    expect(screen.getByTestId('mission-section')).toBeInTheDocument();
  });

  it('renders the TestimonialsSection', () => {
    renderPage();
    expect(screen.getByTestId('testimonials-section')).toBeInTheDocument();
  });

  it('renders the FeaturesSection', () => {
    renderPage();
    expect(screen.getByTestId('features-section')).toBeInTheDocument();
  });
});
