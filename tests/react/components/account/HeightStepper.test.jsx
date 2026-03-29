import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeightStepper from '@/components/account/HeightStepper';

function renderStepper(overrides = {}) {
  const defaults = { heightInches: 70, units: 'Imperial', onChange: vi.fn() };
  return render(<HeightStepper {...defaults} {...overrides} />);
}

describe('HeightStepper', () => {
  it('renders the "Height" label', () => {
    renderStepper();
    expect(screen.getByText('Height')).toBeInTheDocument();
  });

  it('displays Imperial height in feet and inches', () => {
    renderStepper({ heightInches: 70, units: 'Imperial' });
    // 70 inches = 5'10"
    expect(screen.getByText("5'10\"")).toBeInTheDocument();
  });

  it('displays Metric height in cm', () => {
    renderStepper({ heightInches: 70, units: 'Metric' });
    // 70 * 2.54 ≈ 178 cm
    expect(screen.getByText('178 cm')).toBeInTheDocument();
  });

  it('calls onChange with heightInches + 1 when Increase is clicked (Imperial)', () => {
    const onChange = vi.fn();
    renderStepper({ heightInches: 70, units: 'Imperial', onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).toHaveBeenCalledWith(71);
  });

  it('calls onChange with heightInches - 1 when Decrease is clicked (Imperial)', () => {
    const onChange = vi.fn();
    renderStepper({ heightInches: 70, units: 'Imperial', onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onChange).toHaveBeenCalledWith(69);
  });

  it('does not go below a minimum of 12 inches when Decrease is clicked', () => {
    const onChange = vi.fn();
    renderStepper({ heightInches: 12, units: 'Imperial', onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onChange).toHaveBeenCalledWith(12);
  });

  it('enters edit mode when the value text is clicked', () => {
    renderStepper({ heightInches: 70, units: 'Imperial' });
    fireEvent.click(screen.getByText("5'10\""));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('saves the edited value on Enter key', () => {
    const onChange = vi.fn();
    renderStepper({ heightInches: 70, units: 'Imperial', onChange });
    fireEvent.click(screen.getByText("5'10\""));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: "6'0\"" } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(72);
  });

  it('cancels editing on Escape key without calling onChange', () => {
    const onChange = vi.fn();
    renderStepper({ heightInches: 70, units: 'Imperial', onChange });
    fireEvent.click(screen.getByText("5'10\""));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});
