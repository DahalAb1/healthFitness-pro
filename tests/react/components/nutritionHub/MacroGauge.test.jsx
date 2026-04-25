import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MacroGauge from '@/components/nutritionHub/MacroGauge';

const defaultProps = { label: 'Calories', unit: 'kcal', accentColor: 'var(--accent)' };

describe('CalorieGauge', () => {
  it('renders remaining calories when under goal', () => {
    render(<MacroGauge {...defaultProps} total={1000} goal={2500} onGoalChange={vi.fn()} />);
    expect(screen.getByText('1500kcal')).toBeInTheDocument();
    expect(screen.getByText('left')).toBeInTheDocument();
  });

  it('renders exceeded amount when over goal', () => {
    render(<MacroGauge {...defaultProps} total={3000} goal={2500} onGoalChange={vi.fn()} />);
    expect(screen.getByText('500kcal')).toBeInTheDocument();
    expect(screen.getByText('over')).toBeInTheDocument();
  });

  it('shows 0 remaining when total equals goal', () => {
    render(<MacroGauge {...defaultProps} total={2500} goal={2500} onGoalChange={vi.fn()} />);
    expect(screen.getByText('0kcal')).toBeInTheDocument();
    expect(screen.getByText('left')).toBeInTheDocument();
  });

  it('does not show "over" when total is under goal', () => {
    render(<MacroGauge {...defaultProps} total={1000} goal={2000} onGoalChange={vi.fn()} />);
    expect(screen.queryByText('over')).not.toBeInTheDocument();
  });

  it('does not show "left" when total is over goal', () => {
    render(<MacroGauge {...defaultProps} total={3000} goal={2000} onGoalChange={vi.fn()} />);
    expect(screen.queryByText('left')).not.toBeInTheDocument();
  });

  it('renders the goal input with the current goal value', () => {
    render(<MacroGauge {...defaultProps} total={0} goal={2000} onGoalChange={vi.fn()} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(2000);
  });

  it('calls onGoalChange with a parsed integer when the input changes', () => {
    const mockChange = vi.fn();
    render(<MacroGauge {...defaultProps} total={0} goal={2000} onGoalChange={mockChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3000' } });
    expect(mockChange).toHaveBeenCalledWith(3000);
  });

  it('calls onGoalChange with 1 when the input is cleared', () => {
    const mockChange = vi.fn();
    render(<MacroGauge {...defaultProps} total={0} goal={2000} onGoalChange={mockChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } });
    expect(mockChange).toHaveBeenCalledWith(1);
  });

  it('renders an SVG element for the circular gauge', () => {
    const { container } = render(<MacroGauge {...defaultProps} total={500} goal={2000} onGoalChange={vi.fn()} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the background circle', () => {
    const { container } = render(<MacroGauge {...defaultProps} total={500} goal={2000} onGoalChange={vi.fn()} />);
    expect(container.querySelector('.macro-circle-bg')).toBeInTheDocument();
  });

  it('renders the progress circle', () => {
    const { container } = render(<MacroGauge {...defaultProps} total={500} goal={2000} onGoalChange={vi.fn()} />);
    expect(container.querySelector('.macro-circle-progress')).toBeInTheDocument();
  });

  it('shows the full goal as remaining when total is 0', () => {
    render(<MacroGauge {...defaultProps} total={0} goal={1800} onGoalChange={vi.fn()} />);
    expect(screen.getByText('1800kcal')).toBeInTheDocument();
    expect(screen.getByText('left')).toBeInTheDocument();
  });

  it('renders with pct=0 when goal is 0 (avoids division by zero)', () => {
    const { container } = render(
      <MacroGauge {...defaultProps} total={0} goal={0} onGoalChange={vi.fn()} />,
    );
    expect(container.querySelector('.macro-gauge-card')).toBeInTheDocument();
  });
});
