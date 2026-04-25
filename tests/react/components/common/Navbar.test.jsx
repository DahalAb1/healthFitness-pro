import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

let mockAuthState = { user: null, avatar: null };

vi.mock('@/context/useAuth', () => ({
  useAuth: () => mockAuthState,
}));

import { MemoryRouter } from 'react-router-dom';

import Navbar from '@/components/common/Navbar';

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    mockAuthState = { user: null, avatar: null };
  });

  it('renders the site name text', () => {
    renderNavbar();
    expect(screen.getByText('Health Fitness Pro')).toBeInTheDocument();
  });

  it('renders a logo image', () => {
    renderNavbar();
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });

  it('renders the Templates navigation link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: 'Templates' })).toBeInTheDocument();
  });

  it('renders the Library navigation link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: 'Library' })).toBeInTheDocument();
  });

  it('renders the History navigation link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: 'History' })).toBeInTheDocument();
  });

  it('renders the LOGIN link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: 'LOGIN' })).toBeInTheDocument();
  });

  it('renders the SIGN UP link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: 'SIGN UP' })).toBeInTheDocument();
  });

  it('renders a nav element', () => {
    renderNavbar();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders the account link instead of LOGIN/SIGNUP when user is logged in', () => {
    mockAuthState = { user: { display_name: 'Jo', email: 'jo@example.com' }, avatar: null };
    renderNavbar();
    expect(screen.getByRole('link', { name: 'Account' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'LOGIN' })).not.toBeInTheDocument();
  });

  it('shows initials from display_name when user is logged in and no avatar', () => {
    mockAuthState = { user: { display_name: 'Diego Smith', email: 'd@example.com' }, avatar: null };
    renderNavbar();
    // initials = 'Di'
    expect(screen.getByText('DI')).toBeInTheDocument();
  });

  it('falls back to email prefix when display_name is missing', () => {
    mockAuthState = { user: { display_name: '', email: 'alex@example.com' }, avatar: null };
    renderNavbar();
    // initials from email prefix 'alex' → 'AL'
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('falls back to "?" when user has neither display_name nor email', () => {
    mockAuthState = { user: { display_name: '', email: null }, avatar: null };
    renderNavbar();
    // display_name is '' (falsy) and email?.split('@')[0] is undefined → '?'
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders the avatar image when user is logged in and avatar URL is provided', () => {
    mockAuthState = { user: { display_name: 'Jo', email: 'jo@example.com' }, avatar: 'https://example.com/pic.jpg' };
    renderNavbar();
    expect(screen.getByAltText('Profile')).toHaveAttribute('src', 'https://example.com/pic.jpg');
  });
});
