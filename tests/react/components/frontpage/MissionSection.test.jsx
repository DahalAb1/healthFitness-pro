import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MissionSection from '@/components/frontpage/MissionSection';

describe('MissionSection', () => {
  it('renders the "Empowering Your Transformation" heading', () => {
    render(<MissionSection />);
    expect(screen.getByRole('heading', { name: /empowering your transformation/i })).toBeInTheDocument();
  });

  it('renders the "Our Vision" tagline', () => {
    render(<MissionSection />);
    expect(screen.getByText('Our Vision')).toBeInTheDocument();
  });

  it('renders the mission description text', () => {
    render(<MissionSection />);
    expect(screen.getByText(/simplify the complexities of fitness/i)).toBeInTheDocument();
  });

  it('has the section id="mission"', () => {
    render(<MissionSection />);
    expect(document.querySelector('#mission')).toBeInTheDocument();
  });
});
