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

  it('calls onChange with heightInches + 1/2.54 when Increase clicked (Metric)', () => {
    const onChange = vi.fn();
    renderStepper({ heightInches: 70, units: 'Metric', onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).toHaveBeenCalledWith(70 + 1 / 2.54);
  });

  it('calls onChange with heightInches - 1/2.54 when Decrease clicked (Metric)', () => {
    const onChange = vi.fn();
    renderStepper({ heightInches: 70, units: 'Metric', onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onChange).toHaveBeenCalledWith(Math.max(12, 70 - 1 / 2.54));
  });

  it('enters edit mode showing cm value when Metric and value is clicked', () => {
    renderStepper({ heightInches: 70, units: 'Metric' });
    fireEvent.click(screen.getByText('178 cm'));
    expect(screen.getByRole('textbox')).toHaveValue('178');
  });

  it('saves a Metric cm input and calls onChange with converted inches', () => {
    const onChange = vi.fn();
    renderStepper({ heightInches: 70, units: 'Metric', onChange });
    fireEvent.click(screen.getByText('178 cm'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '180' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(Math.max(12, Math.round(180 / 2.54)));
  });

  it('saves an Imperial plain-number input (no ft\'in" format) and calls onChange', () => {
    const onChange = vi.fn();
    renderStepper({ heightInches: 70, units: 'Imperial', onChange });
    fireEvent.click(screen.getByText("5'10\""));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '72' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(Math.max(12, 72));
  });

  it('keeps current height when Metric input is not a valid number', () => {
    const onChange = vi.fn();
    renderStepper({ heightInches: 70, units: 'Metric', onChange });
    fireEvent.click(screen.getByText('178 cm'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    // cm = NaN → else path → newInches stays 70 → onChange(Math.max(12, 70))
    expect(onChange).toHaveBeenCalledWith(Math.max(12, 70));
  });

  it('keeps current height when Imperial plain-number input is not a valid positive integer', () => {
    const onChange = vi.fn();
    renderStepper({ heightInches: 70, units: 'Imperial', onChange });
    fireEvent.click(screen.getByText("5'10\""));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'xyz' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    // parseInt('xyz') = NaN → else path → newInches stays 70 → onChange(Math.max(12, 70))
    expect(onChange).toHaveBeenCalledWith(Math.max(12, 70));
  });
});
