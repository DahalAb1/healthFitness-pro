import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

import { useLoginForm } from '@/hooks/useLoginForm';

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe('useLoginForm', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
  });

  it('initialises with empty email, password, error and loading=false', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper });
    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.showPw).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.loading).toBe(false);
  });

  it('updates email via setEmail', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper });
    act(() => { result.current.setEmail('user@example.com'); });
    expect(result.current.email).toBe('user@example.com');
  });

  it('updates password via setPassword', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper });
    act(() => { result.current.setPassword('mypassword'); });
    expect(result.current.password).toBe('mypassword');
  });

  it('toggles showPw via setShowPw', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper });
    act(() => { result.current.setShowPw(true); });
    expect(result.current.showPw).toBe(true);
    act(() => { result.current.setShowPw(false); });
    expect(result.current.showPw).toBe(false);
  });

  it('calls e.preventDefault on submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLoginForm(), { wrapper });
    const fakeEvent = { preventDefault: vi.fn() };
    await act(async () => { await result.current.handleSubmit(fakeEvent); });
    expect(fakeEvent.preventDefault).toHaveBeenCalled();
  });

  it('calls login with current email and password', async () => {
    mockLogin.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLoginForm(), { wrapper });
    act(() => {
      result.current.setEmail('user@test.com');
      result.current.setPassword('pass123');
    });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'pass123');
  });

  it('navigates to "/" after successful login', async () => {
    mockLogin.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLoginForm(), { wrapper });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('sets error message when login throws', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    const { result } = renderHook(() => useLoginForm(), { wrapper });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('does not navigate on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useLoginForm(), { wrapper });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('resets loading to false after successful submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLoginForm(), { wrapper });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(result.current.loading).toBe(false);
  });

  it('resets loading to false after failed submit', async () => {
    mockLogin.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useLoginForm(), { wrapper });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(result.current.loading).toBe(false);
  });

  it('clears error on re-submit', async () => {
    mockLogin.mockRejectedValueOnce(new Error('First failure'));
    const { result } = renderHook(() => useLoginForm(), { wrapper });
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(result.current.error).toBe('First failure');

    mockLogin.mockResolvedValue(undefined);
    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });
    expect(result.current.error).toBe('');
  });
});
