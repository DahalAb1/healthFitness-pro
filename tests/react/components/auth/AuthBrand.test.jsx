import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/assets/coverphoto.jpg', () => ({ default: 'coverphoto.jpg' }));

import AuthBrand from '@/components/auth/AuthBrand';

describe('AuthBrand', () => {
  it('renders the brand name text', () => {
    render(<AuthBrand />);
    expect(screen.getByText('Health Fitness Pro')).toBeInTheDocument();
  });

  it('renders the logo image', () => {
    render(<AuthBrand />);
    expect(screen.getByAltText('Health Fitness Pro')).toBeInTheDocument();
  });

  it('applies the auth-logo-img class to the image', () => {
    render(<AuthBrand />);
    expect(screen.getByAltText('Health Fitness Pro')).toHaveClass('auth-logo-img');
  });

  it('applies the auth-brand-name class to the brand text span', () => {
    const { container } = render(<AuthBrand />);
    expect(container.querySelector('.auth-brand-name')).toBeInTheDocument();
  });
});
