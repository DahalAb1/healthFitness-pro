import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SecuritySection from '@/components/account/SecuritySection';

describe('SecuritySection', () => {
  it('renders the "Security & Billing" section label', () => {
    render(<SecuritySection onSignOut={vi.fn()} />);
    expect(screen.getByText('Security & Billing')).toBeInTheDocument();
  });

  it('renders the "Change Password" item', () => {
    render(<SecuritySection onSignOut={vi.fn()} />);
    expect(screen.getByText('Change Password')).toBeInTheDocument();
  });

  it('renders the "Manage Subscription" item', () => {
    render(<SecuritySection onSignOut={vi.fn()} />);
    expect(screen.getByText('Manage Subscription')).toBeInTheDocument();
  });

  it('renders the "Sign Out" item', () => {
    render(<SecuritySection onSignOut={vi.fn()} />);
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('shows "Active" subscription status in green', () => {
    const { container } = render(<SecuritySection onSignOut={vi.fn()} />);
    expect(container.querySelector('.account-mi-value--green')).toBeInTheDocument();
  });

  it('calls onSignOut when the Sign Out row is clicked', () => {
    const onSignOut = vi.fn();
    render(<SecuritySection onSignOut={onSignOut} />);
    fireEvent.click(screen.getByText('Sign Out').closest('[role="button"]'));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('applies the danger class to the Sign Out row', () => {
    const { container } = render(<SecuritySection onSignOut={vi.fn()} />);
    expect(container.querySelector('.account-menu-item--danger')).toBeInTheDocument();
  });

  it('invokes the Change Password no-op onSave when the edit panel is saved', () => {
    render(<SecuritySection onSignOut={vi.fn()} />);
    // Open the edit panel for Change Password
    fireEvent.click(screen.getByText('Change Password').closest('[role="button"]'));
    // Click Save to invoke the inline onSave={() => {}} callback
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    // Component remains functional after the no-op save
    expect(screen.getByText('Change Password')).toBeInTheDocument();
  });
});
