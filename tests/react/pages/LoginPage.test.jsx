import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Asset mocks
vi.mock('@/assets/coverphoto.jpg', () => ({ default: 'coverphoto.jpg' }));
vi.mock('@/assets/fitness1.jpg', () => ({ default: 'fitness1.jpg' }));
vi.mock('@/assets/fitness2.webp', () => ({ default: 'fitness2.webp' }));
vi.mock('@/assets/fitness4.jpg', () => ({ default: 'fitness4.jpg' }));
vi.mock('@/assets/fitness6.jpg', () => ({ default: 'fitness6.jpg' }));
vi.mock('@/assets/running.jpg', () => ({ default: 'running.jpg' }));

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

import LoginPage from '@/pages/LoginPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the "Welcome Back." heading', () => {
    renderPage();
    expect(screen.getByText('Welcome Back.')).toBeInTheDocument();
  });

  it('renders the brand name', () => {
    renderPage();
    expect(screen.getByText('Health Fitness Pro')).toBeInTheDocument();
  });

  it('renders the email input', () => {
    renderPage();
    expect(screen.getByPlaceholderText('name@email.com')).toBeInTheDocument();
  });

  it('renders the password field', () => {
    renderPage();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders the "Log In" submit button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
  });

  it('renders the "Sign Up" link', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('renders the "Forgot password?" link', () => {
    renderPage();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('shows no error message initially', () => {
    renderPage();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('calls login and navigates on successful submit', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('name@email.com'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'password'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows an error message when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('name@email.com'), { target: { value: 'bad@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));
    await waitFor(() =>
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument(),
    );
  });

  it('shows "Logging in…" on the button while loading', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {})); // never resolves
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('name@email.com'), { target: { value: 'u@t.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Logging in…' })).toBeInTheDocument(),
    );
  });

  it('disables the submit button while loading', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    renderPage();    fireEvent.change(screen.getByPlaceholderText('name@email.com'), { target: { value: 'u@t.com' } });
    fireEvent.change(screen.getByPlaceholderText('\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'), { target: { value: 'pass' } });    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Logging in…' })).toBeDisabled(),
    );
  });

  it('toggles password visibility when the eye button is clicked', () => {
    renderPage();
    const pwInput = screen.getByPlaceholderText('••••••••');
    expect(pwInput).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: /toggle password visibility/i }));
    expect(pwInput).toHaveAttribute('type', 'text');
  });
});
