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

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ register: mockRegister }),
}));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

import SignUpPage from '@/pages/SignUpPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <SignUpPage />
    </MemoryRouter>,
  );
}

// Helpers to grab fields
const getName   = () => screen.getByPlaceholderText('Jane Doe');
const getEmail  = () => screen.getByPlaceholderText('name@email.com');
const getPw     = () => screen.getAllByPlaceholderText('••••••••')[0];
const getConfirm = () => screen.getAllByPlaceholderText('••••••••')[1];

const STRONG_PW = 'Str0ng!pw';

describe('SignUpPage', () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the "Create Account." heading', () => {
    renderPage();
    expect(screen.getByText('Create Account.')).toBeInTheDocument();
  });

  it('renders the brand name', () => {
    renderPage();
    expect(screen.getByText('Health Fitness Pro')).toBeInTheDocument();
  });

  it('renders the Full Name input', () => {
    renderPage();
    expect(getName()).toBeInTheDocument();
  });

  it('renders the Email input', () => {
    renderPage();
    expect(getEmail()).toBeInTheDocument();
  });

  it('renders two password fields (password + confirm)', () => {
    renderPage();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
  });

  it('renders the "Create Account" submit button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('renders the "Log In" link', () => {
    renderPage();
    expect(screen.getByRole('link', { name: 'Log In' })).toBeInTheDocument();
  });

  it('submit button is disabled when form is incomplete', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeDisabled();
  });

  it('submit button is enabled when all fields are valid and passwords match', () => {
    renderPage();
    fireEvent.change(getName(), { target: { value: 'Jane Doe' } });
    fireEvent.change(getEmail(), { target: { value: 'jane@test.com' } });
    fireEvent.change(getPw(), { target: { value: STRONG_PW } });
    fireEvent.change(getConfirm(), { target: { value: STRONG_PW } });
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeEnabled();
  });

  it('shows the strength meter after typing a password', () => {
    renderPage();
    fireEvent.change(getPw(), { target: { value: 'abc' } });
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
  });

  it('shows "✕ Passwords do not match" when confirm differs', () => {
    renderPage();
    fireEvent.change(getPw(), { target: { value: STRONG_PW } });
    fireEvent.change(getConfirm(), { target: { value: 'different' } });
    expect(screen.getByText('✕ Passwords do not match')).toBeInTheDocument();
  });

  it('shows "✓ Passwords match" when confirm equals password', () => {
    renderPage();
    fireEvent.change(getPw(), { target: { value: STRONG_PW } });
    fireEvent.change(getConfirm(), { target: { value: STRONG_PW } });
    expect(screen.getByText('✓ Passwords match')).toBeInTheDocument();
  });

  it('calls register and navigates on successful submit', async () => {
    mockRegister.mockResolvedValue(undefined);
    renderPage();
    fireEvent.change(getName(), { target: { value: 'Jane Doe' } });
    fireEvent.change(getEmail(), { target: { value: 'jane@test.com' } });
    fireEvent.change(getPw(), { target: { value: STRONG_PW } });
    fireEvent.change(getConfirm(), { target: { value: STRONG_PW } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() => expect(mockRegister).toHaveBeenCalledWith('jane@test.com', STRONG_PW));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows an error message when registration fails', async () => {
    mockRegister.mockRejectedValue(new Error('Email already taken'));
    renderPage();
    fireEvent.change(getName(), { target: { value: 'Jane Doe' } });
    fireEvent.change(getEmail(), { target: { value: 'jane@test.com' } });
    fireEvent.change(getPw(), { target: { value: STRONG_PW } });
    fireEvent.change(getConfirm(), { target: { value: STRONG_PW } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() =>
      expect(screen.getByText('Email already taken')).toBeInTheDocument(),
    );
  });

  it('shows "Creating account..." on the button while loading', async () => {
    mockRegister.mockImplementation(() => new Promise(() => {}));
    renderPage();
    fireEvent.change(getName(), { target: { value: 'Jane Doe' } });
    fireEvent.change(getEmail(), { target: { value: 'jane@test.com' } });
    fireEvent.change(getPw(), { target: { value: STRONG_PW } });
    fireEvent.change(getConfirm(), { target: { value: STRONG_PW } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Creating account...' })).toBeInTheDocument(),
    );
  });
});
