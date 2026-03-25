import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '@/components/common/Footer';

describe('Footer', () => {
  it('renders the brand name', () => {
    render(<Footer />);
    expect(screen.getByText('Health Fitness Pro')).toBeInTheDocument();
  });

  it('renders the logo image', () => {
    render(<Footer />);
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });

  it('renders the copyright notice', () => {
    render(<Footer />);
    expect(screen.getByText(/2026 Health Fitness Pro/)).toBeInTheDocument();
  });

  it('renders the Product section heading', () => {
    render(<Footer />);
    expect(screen.getByRole('heading', { name: 'Product' })).toBeInTheDocument();
  });

  it('renders the Resources section heading', () => {
    render(<Footer />);
    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument();
  });

  it('renders the Company section heading', () => {
    render(<Footer />);
    expect(screen.getByRole('heading', { name: 'Company' })).toBeInTheDocument();
  });

  it('renders a footer element', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders links in the Resources section', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Guides' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Support' })).toBeInTheDocument();
  });

  it('renders links in the Company section', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument();
  });
});
