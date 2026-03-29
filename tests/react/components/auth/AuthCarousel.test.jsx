import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/assets/fitness1.jpg', () => ({ default: 'fitness1.jpg' }));
vi.mock('@/assets/fitness2.webp', () => ({ default: 'fitness2.webp' }));
vi.mock('@/assets/fitness4.jpg', () => ({ default: 'fitness4.jpg' }));
vi.mock('@/assets/fitness6.jpg', () => ({ default: 'fitness6.jpg' }));
vi.mock('@/assets/running.jpg', () => ({ default: 'running.jpg' }));

import AuthCarousel from '@/components/auth/AuthCarousel';

describe('AuthCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the first slide tag "WORKOUTS" on mount', () => {
    render(<AuthCarousel />);
    expect(screen.getByText('WORKOUTS')).toBeInTheDocument();
  });

  it('renders the first slide headline on mount', () => {
    render(<AuthCarousel />);
    expect(screen.getByText('Build strength with guided workout templates.')).toBeInTheDocument();
  });

  it('renders navigation dot buttons for all 5 slides', () => {
    render(<AuthCarousel />);
    const dots = screen.getAllByRole('button', { name: /Slide \d+/ });
    expect(dots).toHaveLength(5);
  });

  it('advances to the second slide after 4500ms', async () => {
    render(<AuthCarousel />);
    await act(async () => { vi.advanceTimersByTime(4500); });
    expect(screen.getByText('NUTRITION')).toBeInTheDocument();
  });

  it('navigates directly to a slide when the dot button is clicked', () => {
    render(<AuthCarousel />);
    fireEvent.click(screen.getByRole('button', { name: 'Slide 3' }));
    expect(screen.getByText('PROGRESS')).toBeInTheDocument();
  });

  it('marks the active dot with auth-dot--active class', () => {
    const { container } = render(<AuthCarousel />);
    const dots = container.querySelectorAll('.auth-dot');
    expect(dots[0]).toHaveClass('auth-dot--active');
    expect(dots[1]).not.toHaveClass('auth-dot--active');
  });

  it('cycles back to the first slide after all 5 slides have played', async () => {
    render(<AuthCarousel />);
    await act(async () => { vi.advanceTimersByTime(4500 * 5); });
    expect(screen.getByText('WORKOUTS')).toBeInTheDocument();
  });
});
