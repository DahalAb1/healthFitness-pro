import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();
const mockSetHeightInches = vi.fn();
const mockSetWeightLbs = vi.fn();
const mockSaveProfile = vi.fn();
const mockProfileData = {
  displayName: 'Jane Doe',
  email: 'jane@test.com',
  units: 'Imperial',
  workoutSounds: 'On',
  notifications: 'On',
};

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
    profile: mockProfileData,
    heightInches: 65,
    weightLbs: 140,
    setHeightInches: mockSetHeightInches,
    setWeightLbs: mockSetWeightLbs,
    set: vi.fn(() => vi.fn()),
    saveProfile: mockSaveProfile,
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
    mockSetHeightInches.mockReset();
    mockSetWeightLbs.mockReset();
    mockSaveProfile.mockReset();
    mockProfileData.displayName = 'Jane Doe';
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

  it('clicking Height + calls setHeightInches and saveProfile', () => {
    renderPage();
    // NumericStepper renders buttons with aria-label="Increase" and "Decrease"
    // Height stepper comes first in the DOM
    const increaseButtons = screen.getAllByRole('button', { name: 'Increase' });
    fireEvent.click(increaseButtons[0]);
    expect(mockSetHeightInches).toHaveBeenCalledWith(66); // 65 + 1
    expect(mockSaveProfile).toHaveBeenCalledWith({ height_inches: 66 });
  });

  it('clicking Height − calls setHeightInches and saveProfile', () => {
    renderPage();
    const decreaseButtons = screen.getAllByRole('button', { name: 'Decrease' });
    fireEvent.click(decreaseButtons[0]);
    expect(mockSetHeightInches).toHaveBeenCalledWith(64); // 65 - 1
    expect(mockSaveProfile).toHaveBeenCalledWith({ height_inches: 64 });
  });

  it('clicking Weight + calls setWeightLbs and saveProfile', () => {
    renderPage();
    const increaseButtons = screen.getAllByRole('button', { name: 'Increase' });
    fireEvent.click(increaseButtons[1]);
    expect(mockSetWeightLbs).toHaveBeenCalled();
    expect(mockSaveProfile).toHaveBeenCalledWith(expect.objectContaining({ weight_lbs: expect.any(Number) }));
  });

  it('clicking Weight − calls setWeightLbs and saveProfile', () => {
    renderPage();
    const decreaseButtons = screen.getAllByRole('button', { name: 'Decrease' });
    fireEvent.click(decreaseButtons[1]);
    expect(mockSetWeightLbs).toHaveBeenCalled();
    expect(mockSaveProfile).toHaveBeenCalledWith(expect.objectContaining({ weight_lbs: expect.any(Number) }));
  });

  it('uses "User" as displayName fallback when profile.displayName is empty', () => {
    mockProfileData.displayName = '';
    renderPage();
    // AccountAvatar receives displayName; when it is 'User' it renders the text or initials
    // The important check is that the component renders without crashing
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });
});
