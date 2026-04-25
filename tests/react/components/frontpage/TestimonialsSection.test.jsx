import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TestimonialsSection from '@/components/frontpage/TestimonialsSection';

describe('TestimonialsSection', () => {
  it('renders the "Trusted by Athletes" heading', () => {
    render(<TestimonialsSection />);
    expect(screen.getByRole('heading', { name: /trusted by athletes/i })).toBeInTheDocument();
  });

  it('renders the "Success Stories" tagline', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText('Success Stories')).toBeInTheDocument();
  });

  it('renders all four testimonial quotes', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText(/the cleanest interface/i)).toBeInTheDocument();
    expect(screen.getByText(/the GPS tracking/i)).toBeInTheDocument();
    expect(screen.getByText(/calorie dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/simple, effective/i)).toBeInTheDocument();
  });

  it('renders all four testimonial names', () => {
    render(<TestimonialsSection />);
    expect(screen.getByText('— Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('— Jordan Smith')).toBeInTheDocument();
    expect(screen.getByText('— Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('— Mike Ross')).toBeInTheDocument();
  });

  it('renders a navigation dot for each testimonial', () => {
    const { container } = render(<TestimonialsSection />);
    expect(container.querySelectorAll('.dot')).toHaveLength(4);
  });

  it('marks the first dot as active by default', () => {
    const { container } = render(<TestimonialsSection />);
    const dots = container.querySelectorAll('.dot');
    expect(dots[0]).toHaveClass('active');
    expect(dots[1]).toHaveClass('inactive');
  });

  it('renders the carousel region with correct aria attributes', () => {
    render(<TestimonialsSection />);
    expect(screen.getByRole('region', { name: 'Testimonials carousel' })).toBeInTheDocument();
  });

  it('calls scrollTo on the carousel when a dot is clicked', () => {
    const { container } = render(<TestimonialsSection />);
    const carousel = container.querySelector('.testimonials-scroll');
    // scrollTo is not defined in jsdom – stub it
    const scrollToSpy = vi.fn();
    Object.defineProperty(carousel, 'scrollTo', { value: scrollToSpy, writable: true });
    // click the third dot (index 2)
    const dots = container.querySelectorAll('.dot');
    fireEvent.click(dots[2]);
    expect(scrollToSpy).toHaveBeenCalledTimes(1);
    const [callArg] = scrollToSpy.mock.calls[0];
    expect(callArg).toMatchObject({ behavior: 'smooth' });
  });

  it('updates the active index when the carousel fires a scroll event', () => {
    const { container } = render(<TestimonialsSection />);
    const carousel = container.querySelector('.testimonials-scroll');
    // Simulate scrollWidth and scrollLeft so handleScroll picks index 2
    Object.defineProperty(carousel, 'scrollWidth', { value: 800, configurable: true });
    Object.defineProperty(carousel, 'scrollLeft', { value: 400, configurable: true });
    act(() => {
      fireEvent.scroll(carousel);
    });
    const dots = container.querySelectorAll('.dot');
    expect(dots[2]).toHaveClass('active');
  });

  it('adds and removes the scroll event listener on mount/unmount', () => {
    const addSpy = vi.spyOn(HTMLElement.prototype, 'addEventListener');
    const removeSpy = vi.spyOn(HTMLElement.prototype, 'removeEventListener');
    const { unmount } = render(<TestimonialsSection />);
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
