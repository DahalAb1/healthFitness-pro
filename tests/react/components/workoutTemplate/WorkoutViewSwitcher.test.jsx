import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WorkoutViewSwitcher from '@/components/workoutTemplate/WorkoutViewSwitcher';

describe('WorkoutViewSwitcher', () => {
  it('renders a TEMPLATES button', () => {
    render(<WorkoutViewSwitcher activeView="templates" setActiveView={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'TEMPLATES' })).toBeInTheDocument();
  });

  it('renders a CUSTOM CREATOR button', () => {
    render(<WorkoutViewSwitcher activeView="templates" setActiveView={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'CUSTOM CREATOR' })).toBeInTheDocument();
  });

  it('applies the active class to TEMPLATES when activeView is "templates"', () => {
    render(<WorkoutViewSwitcher activeView="templates" setActiveView={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'TEMPLATES' })).toHaveClass('active');
  });

  it('does not apply the active class to CUSTOM CREATOR when activeView is "templates"', () => {
    render(<WorkoutViewSwitcher activeView="templates" setActiveView={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'CUSTOM CREATOR' })).not.toHaveClass('active');
  });

  it('applies the active class to CUSTOM CREATOR when activeView is "custom"', () => {
    render(<WorkoutViewSwitcher activeView="custom" setActiveView={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'CUSTOM CREATOR' })).toHaveClass('active');
  });

  it('does not apply the active class to TEMPLATES when activeView is "custom"', () => {
    render(<WorkoutViewSwitcher activeView="custom" setActiveView={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'TEMPLATES' })).not.toHaveClass('active');
  });

  it('calls setActiveView with "templates" when TEMPLATES button is clicked', () => {
    const setActiveView = vi.fn();
    render(<WorkoutViewSwitcher activeView="custom" setActiveView={setActiveView} />);
    fireEvent.click(screen.getByRole('button', { name: 'TEMPLATES' }));
    expect(setActiveView).toHaveBeenCalledWith('templates');
    expect(setActiveView).toHaveBeenCalledTimes(1);
  });

  it('calls setActiveView with "custom" when CUSTOM CREATOR button is clicked', () => {
    const setActiveView = vi.fn();
    render(<WorkoutViewSwitcher activeView="templates" setActiveView={setActiveView} />);
    fireEvent.click(screen.getByRole('button', { name: 'CUSTOM CREATOR' }));
    expect(setActiveView).toHaveBeenCalledWith('custom');
    expect(setActiveView).toHaveBeenCalledTimes(1);
  });
});
