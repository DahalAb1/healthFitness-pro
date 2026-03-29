import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({
    logout: mockLogout,
    avatar: null,
    setAvatar: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/hooks/useAccountProfile', () => ({
  useAccountProfile: () => ({
    profile: {
      displayName: 'Jane Doe',
      email: 'jane@test.com',
      units: 'Imperial',
      workoutSounds: 'On',
      notifications: 'On',
    },
    heightInches: 65,
    weightLbs: 140,
    setHeightInches: vi.fn(),
    setWeightLbs: vi.fn(),
    set: vi.fn(() => vi.fn()),
    saveProfile: vi.fn(),
  }),
}));

vi.mock('@/utils/timerSettings', () => ({
  getDefaultRest: vi.fn(() => 60),
  saveDefaultRest: vi.fn(),
}));

vi.mock('@/components/common/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));

import AccountPage from '@/pages/AccountPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <AccountPage />
    </MemoryRouter>,
  );
}

describe('AccountPage', () => {
  beforeEach(() => {
    mockLogout.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the Navbar', () => {
    renderPage();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders the "Account Settings" heading', () => {
    renderPage();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders the user display name', () => {
    renderPage();
    // display name appears in both the avatar and the Personal Info value — getAllByText handles multiples
    const matches = screen.getAllByText('Jane Doe');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the Personal Information section', () => {
    renderPage();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('renders the App Settings section', () => {
    renderPage();
    expect(screen.getByText('App Settings')).toBeInTheDocument();
  });

  it('renders the Workout Settings section', () => {
    renderPage();
    expect(screen.getByText('Workout Settings')).toBeInTheDocument();
  });

  it('renders the Security & Billing section', () => {
    renderPage();
    expect(screen.getByText('Security & Billing')).toBeInTheDocument();
  });

  it('renders the Height stepper', () => {
    renderPage();
    expect(screen.getByText('Height')).toBeInTheDocument();
  });

  it('renders the Weight stepper', () => {
    renderPage();
    expect(screen.getByText('Weight')).toBeInTheDocument();
  });

  it('renders the Sign Out item', () => {
    renderPage();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('calls logout and navigates to /login when Sign Out is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByText('Sign Out').closest('[role="button"]'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders the version footer', () => {
    renderPage();
    expect(screen.getByText(/v2.4.0/)).toBeInTheDocument();
  });
});
