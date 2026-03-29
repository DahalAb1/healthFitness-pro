import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CalorieGauge from '@/components/nutritionHub/CalorieGauge';

describe('CalorieGauge', () => {
  it('renders remaining calories when under goal', () => {
    render(<CalorieGauge total={1000} goal={2500} onGoalChange={vi.fn()} />);
    expect(screen.getByText('1500')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
  });

  it('renders exceeded amount when over goal', () => {
    render(<CalorieGauge total={3000} goal={2500} onGoalChange={vi.fn()} />);
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('Exceeded')).toBeInTheDocument();
  });

  it('shows 0 remaining when total equals goal', () => {
    render(<CalorieGauge total={2500} goal={2500} onGoalChange={vi.fn()} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
  });

  it('does not show "Exceeded" when total is under goal', () => {
    render(<CalorieGauge total={1000} goal={2000} onGoalChange={vi.fn()} />);
    expect(screen.queryByText('Exceeded')).not.toBeInTheDocument();
  });

  it('does not show "Remaining" when total is over goal', () => {
    render(<CalorieGauge total={3000} goal={2000} onGoalChange={vi.fn()} />);
    expect(screen.queryByText('Remaining')).not.toBeInTheDocument();
  });

  it('renders the goal input with the current goal value', () => {
    render(<CalorieGauge total={0} goal={2000} onGoalChange={vi.fn()} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(2000);
  });

  it('calls onGoalChange with a parsed integer when the input changes', () => {
    const mockChange = vi.fn();
    render(<CalorieGauge total={0} goal={2000} onGoalChange={mockChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3000' } });
    expect(mockChange).toHaveBeenCalledWith(3000);
  });

  it('calls onGoalChange with 2000 when the input is cleared', () => {
    const mockChange = vi.fn();
    render(<CalorieGauge total={0} goal={2000} onGoalChange={mockChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } });
    expect(mockChange).toHaveBeenCalledWith(2000);
  });

  it('renders an SVG element for the circular gauge', () => {
    const { container } = render(<CalorieGauge total={500} goal={2000} onGoalChange={vi.fn()} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the background circle', () => {
    const { container } = render(<CalorieGauge total={500} goal={2000} onGoalChange={vi.fn()} />);
    expect(container.querySelector('.circle-bg')).toBeInTheDocument();
  });

  it('renders the progress circle', () => {
    const { container } = render(<CalorieGauge total={500} goal={2000} onGoalChange={vi.fn()} />);
    expect(container.querySelector('.circle-progress')).toBeInTheDocument();
  });

  it('shows the full goal as remaining when total is 0', () => {
    render(<CalorieGauge total={0} goal={1800} onGoalChange={vi.fn()} />);
    expect(screen.getByText('1800')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
  });
});
