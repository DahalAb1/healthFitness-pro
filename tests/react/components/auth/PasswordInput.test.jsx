import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PasswordInput from '@/components/auth/PasswordInput';

function renderInput(overrides = {}) {
  const defaults = {
    value: '',
    onChange: vi.fn(),
    show: false,
    onToggleShow: vi.fn(),
  };
  return render(<PasswordInput {...defaults} {...overrides} />);
}

describe('PasswordInput', () => {
  it('renders the default "Password" label', () => {
    renderInput();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('renders a custom label when provided', () => {
    renderInput({ label: 'Confirm Password' });
    expect(screen.getByText('Confirm Password')).toBeInTheDocument();
  });

  it('renders as type="password" when show is false', () => {
    renderInput({ show: false });
    expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'password');
  });

  it('renders as type="text" when show is true', () => {
    renderInput({ show: true });
    expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'text');
  });

  it('calls onChange when the input changes', () => {
    const onChange = vi.fn();
    renderInput({ onChange });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleShow when the eye button is clicked', () => {
    const onToggleShow = vi.fn();
    renderInput({ onToggleShow });
    fireEvent.click(screen.getByRole('button', { name: /toggle password visibility/i }));
    expect(onToggleShow).toHaveBeenCalledTimes(1);
  });

  it('renders the toggle button with the correct aria-label', () => {
    renderInput();
    expect(screen.getByRole('button', { name: /toggle password visibility/i })).toBeInTheDocument();
  });

  it('reflects the current value in the input', () => {
    renderInput({ value: 'mypassword', show: true });
    expect(screen.getByDisplayValue('mypassword')).toBeInTheDocument();
  });

  it('applies a custom inputClassName when provided', () => {
    renderInput({ inputClassName: 'auth-input--error' });
    expect(screen.getByPlaceholderText('••••••••')).toHaveClass('auth-input--error');
  });
});
