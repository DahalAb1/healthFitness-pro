import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WorkoutTemplateHero from '@/components/workoutTemplate/WorkoutTemplateHero';

describe('WorkoutTemplateHero', () => {
  it('renders the "Workout Template" heading', () => {
    render(<WorkoutTemplateHero />);
    expect(screen.getByRole('heading', { name: 'Workout Template' })).toBeInTheDocument();
  });

  it('renders the "Training Hub" tagline', () => {
    render(<WorkoutTemplateHero />);
    expect(screen.getByText('Training Hub')).toBeInTheDocument();
  });
});
