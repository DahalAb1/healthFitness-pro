import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TrendsStatsBar from '@/components/history/TrendsStatsBar';

describe('TrendsStatsBar', () => {
  it('renders null when no meta is provided', () => {
    const { container } = render(<TrendsStatsBar />);
    expect(container.firstChild).toBeNull();
  });

  it('applies stat-up class and + prefix when change is positive', () => {
    const { container } = render(
      <TrendsStatsBar meta={{ first_weight: 180, last_weight: 185, change: 5, percent_change: 2.8 }} />,
    );
    expect(container.querySelector('.stat-up')).toBeInTheDocument();
    expect(screen.getByText(/\+5\.0 lbs/)).toBeInTheDocument();
  });

  it('applies stat-down class and no + prefix when change is negative', () => {
    const { container } = render(
      <TrendsStatsBar meta={{ first_weight: 200, last_weight: 180, change: -20, percent_change: -10 }} />,
    );
    const span = container.querySelector('.stat-down');
    expect(span).toBeInTheDocument();
    expect(span.textContent).toContain('-20.0 lbs');
    expect(span.textContent).not.toMatch(/^\+/);
  });
});
