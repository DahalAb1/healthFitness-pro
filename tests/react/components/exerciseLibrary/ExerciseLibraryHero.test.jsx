import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExerciseLibraryHero from '@/components/exerciseLibrary/ExerciseLibraryHero';

describe('ExerciseLibraryHero', () => {
  it('renders the "Exercise Library" heading', () => {
    render(<ExerciseLibraryHero />);
    expect(screen.getByRole('heading', { name: 'Exercise Library' })).toBeInTheDocument();
  });

  it('renders the subtitle text', () => {
    render(<ExerciseLibraryHero />);
    expect(screen.getByText(/comprehensive collection of exercises/i)).toBeInTheDocument();
  });
});
