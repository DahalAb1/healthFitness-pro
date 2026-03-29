import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ user: null, avatar: null }),
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
});
