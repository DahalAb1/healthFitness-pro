import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

import { useSignUpForm } from '@/hooks/useSignUpForm';

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

// A password that satisfies all 5 rules: length≥8, uppercase, lowercase, digit, special char
const STRONG_PASSWORD = 'Password1!';
const STRONG_FORM = {
  name: 'John Doe',
  email: 'john@test.com',
  password: STRONG_PASSWORD,
  confirm: STRONG_PASSWORD,
};

function fillValidForm(result) {
  act(() => {
    result.current.update('name')({ target: { value: STRONG_FORM.name } });
    result.current.update('email')({ target: { value: STRONG_FORM.email } });
    result.current.update('password')({ target: { value: STRONG_FORM.password } });
    result.current.update('confirm')({ target: { value: STRONG_FORM.confirm } });
  });
}

describe('useSignUpForm', () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockNavigate.mockReset();
  });

  it('initialises with empty form and false flags', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    expect(result.current.form).toEqual({ name: '', email: '', password: '', confirm: '' });
    expect(result.current.showPw).toBe(false);
    expect(result.current.showConfirm).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.loading).toBe(false);
  });

  it('update("name") sets form.name', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    act(() => { result.current.update('name')({ target: { value: 'Alice' } }); });
    expect(result.current.form.name).toBe('Alice');
  });

  it('update("email") sets form.email', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    act(() => { result.current.update('email')({ target: { value: 'alice@test.com' } }); });
    expect(result.current.form.email).toBe('alice@test.com');
  });

  it('update("password") sets form.password', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    act(() => { result.current.update('password')({ target: { value: 'Pass1!' } }); });
    expect(result.current.form.password).toBe('Pass1!');
  });

  it('update("confirm") sets form.confirm', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    act(() => { result.current.update('confirm')({ target: { value: 'Pass1!' } }); });
    expect(result.current.form.confirm).toBe('Pass1!');
  });

  it('toggles showPw and showConfirm', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    act(() => { result.current.setShowPw(true); });
    expect(result.current.showPw).toBe(true);
    act(() => { result.current.setShowConfirm(true); });
    expect(result.current.showConfirm).toBe(true);
  });

  it('matches is true when password === confirm', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    act(() => {
      result.current.update('password')({ target: { value: 'Pass1!' } });
      result.current.update('confirm')({ target: { value: 'Pass1!' } });
    });
    expect(result.current.matches).toBe(true);
  });

  it('matches is false when password !== confirm', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    act(() => {
      result.current.update('password')({ target: { value: 'Pass1!' } });
      result.current.update('confirm')({ target: { value: 'Different1!' } });
    });
    expect(result.current.matches).toBe(false);
  });

  it('canSubmit is false with empty form', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    expect(result.current.canSubmit).toBeFalsy();
  });

  it('canSubmit is true when all fields are valid and passwords match', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    fillValidForm(result);
    expect(result.current.canSubmit).toBeTruthy();
  });

  it('canSubmit is false when passwords do not match', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    act(() => {
      result.current.update('name')({ target: { value: STRONG_FORM.name } });
      result.current.update('email')({ target: { value: STRONG_FORM.email } });
      result.current.update('password')({ target: { value: STRONG_FORM.password } });
      result.current.update('confirm')({ target: { value: 'WrongMismatch9!' } });
    });
    expect(result.current.canSubmit).toBe(false);
  });

  it('allPassed is false for a weak password', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    act(() => { result.current.update('password')({ target: { value: 'short' } }); });
    expect(result.current.allPassed).toBe(false);
  });

  it('allPassed is true for a strong password', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    act(() => { result.current.update('password')({ target: { value: STRONG_PASSWORD } }); });
    expect(result.current.allPassed).toBe(true);
  });

  it('strength.level is 0 for an empty password and 5 for a fully strong password', () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    expect(result.current.strength.level).toBe(0);
    act(() => { result.current.update('password')({ target: { value: STRONG_PASSWORD } }); });
    expect(result.current.strength.level).toBe(5);
  });

  it('calls e.preventDefault on submit', async () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    const fakeEvent = { preventDefault: vi.fn() };
    await act(async () => { await result.current.handleSubmit(fakeEvent); });
    expect(fakeEvent.preventDefault).toHaveBeenCalled();
  });

  it('handleSubmit does not call register when canSubmit is false', async () => {
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('handleSubmit calls register with email and password on valid form', async () => {
    mockRegister.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    fillValidForm(result);
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(mockRegister).toHaveBeenCalledWith(STRONG_FORM.email, STRONG_FORM.password);
  });

  it('navigates to "/" after successful registration', async () => {
    mockRegister.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    fillValidForm(result);
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('sets error when register throws', async () => {
    mockRegister.mockRejectedValue(new Error('Email already taken'));
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    fillValidForm(result);
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(result.current.error).toBe('Email already taken');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('resets loading to false after submission', async () => {
    mockRegister.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    fillValidForm(result);
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(result.current.loading).toBe(false);
  });

  it('resets loading to false after a failed submission', async () => {
    mockRegister.mockRejectedValue(new Error('Server error'));
    const { result } = renderHook(() => useSignUpForm(), { wrapper });
    fillValidForm(result);
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(result.current.loading).toBe(false);
  });
});
