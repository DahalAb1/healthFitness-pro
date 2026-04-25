import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WeightStepper from '@/components/account/WeightStepper';

function renderStepper(overrides = {}) {
  const defaults = { weightLbs: 160, units: 'Imperial', onChange: vi.fn() };
  return render(<WeightStepper {...defaults} {...overrides} />);
}

describe('WeightStepper', () => {
  it('renders the "Weight" label', () => {
    renderStepper();
    expect(screen.getByText('Weight')).toBeInTheDocument();
  });

  it('displays Imperial weight in lbs', () => {
    renderStepper({ weightLbs: 160, units: 'Imperial' });
    expect(screen.getByText('160 lbs')).toBeInTheDocument();
  });

  it('displays Metric weight in kg', () => {
    renderStepper({ weightLbs: 154, units: 'Metric' });
    // 154 * 0.453592 ≈ 70 kg
    expect(screen.getByText('70 kg')).toBeInTheDocument();
  });

  it('calls onChange with weightLbs + 1 when Increase is clicked (Imperial)', () => {
    const onChange = vi.fn();
    renderStepper({ weightLbs: 160, units: 'Imperial', onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).toHaveBeenCalledWith(161);
  });

  it('calls onChange with weightLbs - 1 when Decrease is clicked (Imperial)', () => {
    const onChange = vi.fn();
    renderStepper({ weightLbs: 160, units: 'Imperial', onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onChange).toHaveBeenCalledWith(159);
  });

  it('does not go below 1 lbs when Decrease is clicked at minimum', () => {
    const onChange = vi.fn();
    renderStepper({ weightLbs: 1, units: 'Imperial', onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('enters edit mode when the value text is clicked', () => {
    renderStepper({ weightLbs: 160, units: 'Imperial' });
    fireEvent.click(screen.getByText('160 lbs'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('saves the edited value on Enter key', () => {
    const onChange = vi.fn();
    renderStepper({ weightLbs: 160, units: 'Imperial', onChange });
    fireEvent.click(screen.getByText('160 lbs'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '180' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(180);
  });

  it('cancels editing on Escape key without calling onChange', () => {
    const onChange = vi.fn();
    renderStepper({ weightLbs: 160, units: 'Imperial', onChange });
    fireEvent.click(screen.getByText('160 lbs'));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('calls onChange with kg+1 converted to lbs when Increase clicked (Metric)', () => {
    const onChange = vi.fn();
    // 154 lbs ≈ 70 kg; after +1 kg → 71 kg → ~157 lbs
    renderStepper({ weightLbs: 154, units: 'Metric', onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Increase' }));
    const kg = Math.round(154 * 0.453592);
    expect(onChange).toHaveBeenCalledWith(Math.round((kg + 1) / 0.453592));
  });

  it('calls onChange with kg-1 converted to lbs when Decrease clicked (Metric)', () => {
    const onChange = vi.fn();
    renderStepper({ weightLbs: 154, units: 'Metric', onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    const kg = Math.round(154 * 0.453592);
    expect(onChange).toHaveBeenCalledWith(Math.max(1, Math.round((kg - 1) / 0.453592)));
  });

  it('enters edit mode showing kg value when Metric and value is clicked', () => {
    // 154 lbs ≈ 70 kg
    renderStepper({ weightLbs: 154, units: 'Metric' });
    fireEvent.click(screen.getByText('70 kg'));
    expect(screen.getByRole('textbox')).toHaveValue('70');
  });

  it('saves a Metric kg input and calls onChange with converted lbs', () => {
    const onChange = vi.fn();
    renderStepper({ weightLbs: 154, units: 'Metric', onChange });
    fireEvent.click(screen.getByText('70 kg'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '70' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(Math.round(70 / 0.453592));
  });

  it('does not call onChange when saved value is invalid (zero)', () => {
    const onChange = vi.fn();
    renderStepper({ weightLbs: 160, units: 'Imperial', onChange });
    fireEvent.click(screen.getByText('160 lbs'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
