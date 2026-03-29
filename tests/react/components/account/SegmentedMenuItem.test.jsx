import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SegmentedMenuItem from '@/components/account/SegmentedMenuItem';

const ICON = <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /></>;

function renderItem(overrides = {}) {
  const defaults = {
    icon: ICON,
    label: 'Workout Sounds',
    options: ['On', 'Off'],
    value: 'On',
    onChange: vi.fn(),
  };
  return render(<SegmentedMenuItem {...defaults} {...overrides} />);
}

describe('SegmentedMenuItem', () => {
  it('renders the label', () => {
    renderItem();
    expect(screen.getByText('Workout Sounds')).toBeInTheDocument();
  });

  it('renders a button for each option', () => {
    renderItem();
    expect(screen.getByRole('button', { name: 'On' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Off' })).toBeInTheDocument();
  });

  it('marks the active option with account-seg-btn--active class', () => {
    renderItem({ value: 'On' });
    expect(screen.getByRole('button', { name: 'On' })).toHaveClass('account-seg-btn--active');
    expect(screen.getByRole('button', { name: 'Off' })).not.toHaveClass('account-seg-btn--active');
  });

  it('marks the other option as active when value changes', () => {
    renderItem({ value: 'Off' });
    expect(screen.getByRole('button', { name: 'Off' })).toHaveClass('account-seg-btn--active');
    expect(screen.getByRole('button', { name: 'On' })).not.toHaveClass('account-seg-btn--active');
  });

  it('calls onChange with the selected option when a button is clicked', () => {
    const onChange = vi.fn();
    renderItem({ onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Off' }));
    expect(onChange).toHaveBeenCalledWith('Off');
  });

  it('calls onChange with the correct option for 3-option controls', () => {
    const onChange = vi.fn();
    renderItem({ options: ['Imperial', 'Metric'], value: 'Imperial', onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Metric' }));
    expect(onChange).toHaveBeenCalledWith('Metric');
  });
});
