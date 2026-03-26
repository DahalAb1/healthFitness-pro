import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HeroSlideshow from '@/components/frontpage/HeroSlideshow';

// Image assets resolve to strings in the test environment
describe('HeroSlideshow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the site heading', () => {
    render(<HeroSlideshow />);
    expect(screen.getByRole('heading', { name: 'Health Fitness Pro' })).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<HeroSlideshow />);
    expect(screen.getByText('Your fitness journey starts here!')).toBeInTheDocument();
  });

  it('renders the Get Started link', () => {
    render(<HeroSlideshow />);
    expect(screen.getByRole('link', { name: 'Get Started Today' })).toBeInTheDocument();
  });

  it('renders all three slide images', () => {
    render(<HeroSlideshow />);
    expect(screen.getByAltText('Hero 1')).toBeInTheDocument();
    expect(screen.getByAltText('Hero 2')).toBeInTheDocument();
    expect(screen.getByAltText('Hero 3')).toBeInTheDocument();
  });

  it('first slide starts with the active class', () => {
    const { container } = render(<HeroSlideshow />);
    const slides = container.querySelectorAll('.slide');
    expect(slides[0]).toHaveClass('active');
    expect(slides[1]).not.toHaveClass('active');
    expect(slides[2]).not.toHaveClass('active');
  });

  it('advances to the next slide after 5 seconds', () => {
    const { container } = render(<HeroSlideshow />);
    act(() => { vi.advanceTimersByTime(5000); });
    const slides = container.querySelectorAll('.slide');
    expect(slides[1]).toHaveClass('active');
    expect(slides[0]).not.toHaveClass('active');
  });

  it('wraps back to the first slide after all slides have played', () => {
    const { container } = render(<HeroSlideshow />);
    act(() => { vi.advanceTimersByTime(15000); }); // 3 × 5000 ms
    const slides = container.querySelectorAll('.slide');
    expect(slides[0]).toHaveClass('active');
  });
});
