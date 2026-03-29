import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/utils/timerSettings', () => ({
  getDefaultRest: vi.fn(() => 60),
  saveDefaultRest: vi.fn(),
}));

import WorkoutSettingsSection from '@/components/account/WorkoutSettingsSection';
import { saveDefaultRest } from '@/utils/timerSettings';

describe('WorkoutSettingsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the "Workout Settings" label', () => {
    render(<WorkoutSettingsSection />);
    expect(screen.getByText('Workout Settings')).toBeInTheDocument();
  });

  it('renders preset buttons for 30s, 60s, 90s, 120s', () => {
    render(<WorkoutSettingsSection />);
    expect(screen.getByRole('button', { name: '30s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '60s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '90s' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '120s' })).toBeInTheDocument();
  });

  it('marks the default rest value button as active on load', () => {
    render(<WorkoutSettingsSection />);
    // getDefaultRest returns 60 by default
    expect(screen.getByRole('button', { name: '60s' })).toHaveClass('account-seg-btn--active');
  });

  it('changes the active preset when a different button is clicked', () => {
    render(<WorkoutSettingsSection />);
    fireEvent.click(screen.getByRole('button', { name: '90s' }));
    expect(screen.getByRole('button', { name: '90s' })).toHaveClass('account-seg-btn--active');
    expect(screen.getByRole('button', { name: '60s' })).not.toHaveClass('account-seg-btn--active');
  });

  it('renders the "Save" button', () => {
    render(<WorkoutSettingsSection />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('calls saveDefaultRest with the selected value when Save is clicked', () => {
    render(<WorkoutSettingsSection />);
    fireEvent.click(screen.getByRole('button', { name: '120s' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(saveDefaultRest).toHaveBeenCalledWith(120);
  });

  it('changes "Save" button text to "Saved!" after saving', () => {
    render(<WorkoutSettingsSection />);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('button', { name: 'Saved!' })).toBeInTheDocument();
  });

  it('resets "Saved!" label back to "Save" when a different preset is selected', () => {
    render(<WorkoutSettingsSection />);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    fireEvent.click(screen.getByRole('button', { name: '30s' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
