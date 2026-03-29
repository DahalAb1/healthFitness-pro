import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/assets/food_pyramid.jpg', () => ({ default: 'food_pyramid.jpg' }));

import NutritionHero from '@/components/nutritionHub/NutritionHero';

describe('NutritionHero', () => {
  it('renders the "Nutrition" heading', () => {
    render(<NutritionHero total={0} goal={2000} />);
    expect(screen.getByRole('heading', { name: 'Nutrition' })).toBeInTheDocument();
  });

  it('displays today\'s total calorie count', () => {
    render(<NutritionHero total={1250} goal={2000} />);
    expect(screen.getByText('1250')).toBeInTheDocument();
  });

  it('shows 0 kcal when no food has been logged', () => {
    render(<NutritionHero total={0} goal={2000} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders the hero image', () => {
    render(<NutritionHero total={0} goal={2000} />);
    expect(screen.getByAltText('Nutrition')).toBeInTheDocument();
  });

  it('renders the description paragraph', () => {
    render(<NutritionHero total={0} goal={2000} />);
    expect(screen.getByText(/Track your daily calories/i)).toBeInTheDocument();
  });

  it('does not apply the "over" class when total is under the goal', () => {
    const { container } = render(<NutritionHero total={1000} goal={2000} />);
    const pill = container.querySelector('.stat-pill');
    expect(pill).not.toHaveClass('over');
  });

  it('applies the "over" class to the stat pill when total exceeds the goal', () => {
    const { container } = render(<NutritionHero total={2500} goal={2000} />);
    const pill = container.querySelector('.stat-pill');
    expect(pill).toHaveClass('over');
  });

  it('does not apply the "over" class when total equals the goal', () => {
    const { container } = render(<NutritionHero total={2000} goal={2000} />);
    const pill = container.querySelector('.stat-pill');
    expect(pill).not.toHaveClass('over');
  });

  it('shows the "TODAY:" label in the stat pill', () => {
    render(<NutritionHero total={500} goal={2000} />);
    expect(screen.getByText(/TODAY:/i)).toBeInTheDocument();
  });

  it('shows "KCAL" label in the stat strip', () => {
    render(<NutritionHero total={500} goal={2000} />);
    expect(screen.getByText(/KCAL/i)).toBeInTheDocument();
  });
});
