import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExerciseFilterBar from '@/components/exerciseLibrary/ExerciseFilterBar';

const FILTERS = ['ALL', 'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'ABS'];

describe('ExerciseFilterBar', () => {
  it('renders all 8 filter buttons', () => {
    render(<ExerciseFilterBar activeFilter="ALL" onFilterChange={vi.fn()} />);
    FILTERS.forEach((f) => {
      expect(screen.getByRole('button', { name: f })).toBeInTheDocument();
    });
  });

  it('applies the active class to the current active filter button', () => {
    render(<ExerciseFilterBar activeFilter="CHEST" onFilterChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'CHEST' })).toHaveClass('active');
  });

  it('does not apply active class to inactive filter buttons', () => {
    render(<ExerciseFilterBar activeFilter="CHEST" onFilterChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'ALL' })).not.toHaveClass('active');
    expect(screen.getByRole('button', { name: 'BACK' })).not.toHaveClass('active');
  });

  it('calls onFilterChange with the correct filter label when clicked', () => {
    const onFilterChange = vi.fn();
    render(<ExerciseFilterBar activeFilter="ALL" onFilterChange={onFilterChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'BACK' }));
    expect(onFilterChange).toHaveBeenCalledWith('BACK');
    expect(onFilterChange).toHaveBeenCalledTimes(1);
  });

  it('calls onFilterChange once per button click across all filters', () => {
    const onFilterChange = vi.fn();
    render(<ExerciseFilterBar activeFilter="ALL" onFilterChange={onFilterChange} />);
    FILTERS.forEach((f) => fireEvent.click(screen.getByRole('button', { name: f })));
    expect(onFilterChange).toHaveBeenCalledTimes(FILTERS.length);
  });

  it('calls onFilterChange with "ALL" when the ALL button is clicked', () => {
    const onFilterChange = vi.fn();
    render(<ExerciseFilterBar activeFilter="CHEST" onFilterChange={onFilterChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'ALL' }));
    expect(onFilterChange).toHaveBeenCalledWith('ALL');
  });
});
