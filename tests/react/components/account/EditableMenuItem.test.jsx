import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EditableMenuItem from '@/components/account/EditableMenuItem';

const ICON = <><rect x="2" y="4" width="20" height="16" rx="2" /></>;

function renderItem(overrides = {}) {
  const defaults = {
    icon: ICON,
    label: 'Email',
    value: 'user@example.com',
    editable: true,
    editType: 'email',
    onSave: vi.fn(),
  };
  return render(<EditableMenuItem {...defaults} {...overrides} />);
}

describe('EditableMenuItem', () => {
  it('renders the label', () => {
    renderItem();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders the current value', () => {
    renderItem();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('does not show the edit input initially', () => {
    renderItem();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('opens the edit input when an editable row is clicked', () => {
    renderItem();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('closes the edit input after clicking Cancel', () => {
    renderItem();
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('calls onSave with the edited value when Save is clicked', () => {
    const onSave = vi.fn();
    renderItem({ onSave });
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new@email.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith('new@email.com');
  });

  it('calls onSave on Enter key press', () => {
    const onSave = vi.fn();
    renderItem({ onSave });
    fireEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'enter@email.com' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSave).toHaveBeenCalledWith('enter@email.com');
  });

  it('cancels editing on Escape key without calling onSave', () => {
    const onSave = vi.fn();
    renderItem({ onSave });
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('calls onClick when the row is not editable and onClick is provided', () => {
    const onClick = vi.fn();
    renderItem({ editable: false, onClick, value: undefined });
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies the danger class when danger prop is true', () => {
    const { container } = renderItem({ editable: false, danger: true, value: undefined });
    expect(container.querySelector('.account-menu-item--danger')).toBeInTheDocument();
  });

  it('applies the green value class when valueGreen is true', () => {
    const { container } = renderItem({ valueGreen: true, editable: false });
    expect(container.querySelector('.account-mi-value--green')).toBeInTheDocument();
  });

  it('does nothing when row is clicked and neither editable nor onClick are provided', () => {
    // Neither editable nor onClick — handleRowClick should be a no-op
    renderItem({ editable: false, onClick: undefined, value: 'info' });
    fireEvent.click(screen.getByRole('button'));
    // no edit form should appear and no error thrown
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('closes the edit form when Save is clicked even if onSave is not provided', () => {
    renderItem({ editable: true, onSave: undefined });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('triggers handleRowClick via keyboard Enter on the row div', () => {
    renderItem({ editable: true });
    // Fire Enter on the role="button" element to trigger onKeyDown
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
