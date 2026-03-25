import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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
});
