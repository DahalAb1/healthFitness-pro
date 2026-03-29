import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/utils/passwordStrength', () => ({
  PASSWORD_RULES: [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'Uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
    { label: 'Lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
    { label: 'Number (0–9)', test: (p) => /\d/.test(p) },
    { label: 'Special character (!@#$…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
  ],
}));

import ConfirmPasswordField from '@/components/auth/ConfirmPasswordField';

function renderField(overrides = {}) {
  const defaults = { value: '', onChange: vi.fn(), show: false, onToggleShow: vi.fn(), matches: false };
  return render(<ConfirmPasswordField {...defaults} {...overrides} />);
}

describe('ConfirmPasswordField', () => {
  it('renders the "Confirm Password" label', () => {
    renderField();
    expect(screen.getByText('Confirm Password')).toBeInTheDocument();
  });

  it('does not show a match message when value is empty', () => {
    renderField({ value: '' });
    expect(screen.queryByText(/Passwords/)).toBeNull();
  });

  it('shows "✕ Passwords do not match" when value is set and matches is false', () => {
    renderField({ value: 'abc', matches: false });
    expect(screen.getByText('✕ Passwords do not match')).toBeInTheDocument();
  });

  it('shows "✓ Passwords match" when value is set and matches is true', () => {
    renderField({ value: 'abc', matches: true });
    expect(screen.getByText('✓ Passwords match')).toBeInTheDocument();
  });

  it('applies auth-pw-match--ok class when passwords match', () => {
    const { container } = renderField({ value: 'abc', matches: true });
    expect(container.querySelector('.auth-pw-match--ok')).toBeInTheDocument();
  });

  it('does not apply auth-pw-match--ok class when passwords do not match', () => {
    const { container } = renderField({ value: 'abc', matches: false });
    expect(container.querySelector('.auth-pw-match--ok')).toBeNull();
  });

  it('applies auth-input--error class to the input when value exists and does not match', () => {
    renderField({ value: 'abc', matches: false });
    const input = screen.getByPlaceholderText('••••••••');
    expect(input).toHaveClass('auth-input--error');
  });

  it('does not apply auth-input--error when passwords match', () => {
    renderField({ value: 'abc', matches: true });
    const input = screen.getByPlaceholderText('••••••••');
    expect(input).not.toHaveClass('auth-input--error');
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    renderField({ onChange });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
