import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/utils/passwordStrength', () => ({
  PASSWORD_RULES: [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'Uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
    { label: 'Lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
    { label: 'Number (0–9)', test: (p) => /\d/.test(p) },
    { label: 'Special character (!@#$…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
  ],
}));

import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';

describe('PasswordStrengthMeter', () => {
  it('renders nothing when password is empty', () => {
    const { container } = render(
      <PasswordStrengthMeter password="" strength={{ level: 0, label: 'Very Weak', color: '#FF4444' }} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the strength label when password is non-empty', () => {
    render(
      <PasswordStrengthMeter password="abc" strength={{ level: 1, label: 'Very Weak', color: '#FF4444' }} />,
    );
    expect(screen.getByText('Very Weak')).toBeInTheDocument();
  });

  it('renders all password rule labels', () => {
    render(
      <PasswordStrengthMeter password="abc" strength={{ level: 1, label: 'Very Weak', color: '#FF4444' }} />,
    );
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('Uppercase letter (A–Z)')).toBeInTheDocument();
    expect(screen.getByText('Lowercase letter (a–z)')).toBeInTheDocument();
    expect(screen.getByText('Number (0–9)')).toBeInTheDocument();
    expect(screen.getByText('Special character (!@#$…)')).toBeInTheDocument();
  });

  it('shows a ✓ next to a passing rule', () => {
    // "abc" passes lowercase rule only
    render(
      <PasswordStrengthMeter password="abc" strength={{ level: 1, label: 'Very Weak', color: '#FF4444' }} />,
    );
    const rules = screen.getAllByText('✓');
    expect(rules.length).toBeGreaterThanOrEqual(1);
  });

  it('shows a ✕ next to a failing rule', () => {
    // "abc" fails several rules
    render(
      <PasswordStrengthMeter password="abc" strength={{ level: 1, label: 'Very Weak', color: '#FF4444' }} />,
    );
    const failing = screen.getAllByText('✕');
    expect(failing.length).toBeGreaterThanOrEqual(1);
  });

  it('marks rules with auth-pw-rule--ok class when they pass', () => {
    const { container } = render(
      <PasswordStrengthMeter password="abc" strength={{ level: 1, label: 'Very Weak', color: '#FF4444' }} />,
    );
    const okRules = container.querySelectorAll('.auth-pw-rule--ok');
    // "abc" passes lowercase rule
    expect(okRules.length).toBeGreaterThanOrEqual(1);
  });

  it('renders bar segments equal to the number of rules', () => {
    const { container } = render(
      <PasswordStrengthMeter password="Abc1!" strength={{ level: 4, label: 'Strong', color: '#4ADE80' }} />,
    );
    const segments = container.querySelectorAll('.auth-pw-bar-seg');
    expect(segments).toHaveLength(5);
  });
});
