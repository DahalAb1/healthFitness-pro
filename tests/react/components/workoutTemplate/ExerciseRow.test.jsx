import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExerciseRow from '@/components/workoutTemplate/ExerciseRow';

const defaultRow = {
  id: 1,
  exercise: 'Bench Press',
  sets: 3,
  reps: 10,
  rest: '60s',
};

function renderRow(overrides = {}) {
  const onUpdate = vi.fn();
  const onRemove = vi.fn();
  const onAddRowAfter = vi.fn();
  const onOpenLibraryForRow = vi.fn();
  const onDragStartRow = vi.fn();
  const onDragOverRow = vi.fn();
  const onDropRow = vi.fn();
  const onDragEndRow = vi.fn();
  const row = { ...defaultRow, ...overrides };
  const utils = render(
    <table>
      <tbody>
        <ExerciseRow
          row={row}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onAddRowAfter={onAddRowAfter}
          onOpenLibraryForRow={onOpenLibraryForRow}
          onDragStartRow={onDragStartRow}
          onDragOverRow={onDragOverRow}
          onDropRow={onDropRow}
          onDragEndRow={onDragEndRow}
        />
      </tbody>
    </table>,
  );
  return { ...utils, onUpdate, onRemove, onOpenLibraryForRow };
}

describe('ExerciseRow', () => {
  it('renders the exercise name as a button with the current value', () => {
    renderRow();
    expect(screen.getByRole('button', { name: 'Change exercise for row' })).toBeInTheDocument();
  });

  it('renders the sets input with the current value', () => {
    renderRow();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  it('renders the reps input with the current value', () => {
    renderRow();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('renders the rest input with the current value', () => {
    renderRow();
    expect(screen.getByDisplayValue('60s')).toBeInTheDocument();
  });

  it('renders the remove button', () => {
    renderRow();
    expect(screen.getByRole('button', { name: 'Remove exercise row' })).toBeInTheDocument();
  });

  it('calls onOpenLibraryForRow with the row id when the exercise button is clicked', () => {
    const { onOpenLibraryForRow } = renderRow();
    fireEvent.click(screen.getByRole('button', { name: 'Change exercise for row' }));
    expect(onOpenLibraryForRow).toHaveBeenCalledWith(1);
  });

  it('calls onUpdate with sets field when the sets input changes', () => {
    const { onUpdate } = renderRow();
    fireEvent.change(screen.getByDisplayValue('3'), {
      target: { value: '4' },
    });
    expect(onUpdate).toHaveBeenCalledWith(1, 'sets', 4);
  });

  it('calls onUpdate with reps field when the reps input changes', () => {
    const { onUpdate } = renderRow();
    fireEvent.change(screen.getByDisplayValue('10'), {
      target: { value: '12' },
    });
    expect(onUpdate).toHaveBeenCalledWith(1, 'reps', 12);
  });

  it('calls onUpdate with rest field when the rest input changes', () => {
    const { onUpdate } = renderRow();
    fireEvent.change(screen.getByDisplayValue('60s'), {
      target: { value: '90s' },
    });
    expect(onUpdate).toHaveBeenCalledWith(1, 'rest', '90s');
  });

  it('calls onRemove with the row id when the remove button is clicked', () => {
    const { onRemove } = renderRow();
    fireEvent.click(screen.getByRole('button', { name: 'Remove exercise row' }));
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('renders "Add Exercise" when exercise is empty', () => {
    renderRow({ exercise: '' });
    expect(screen.getByRole('button', { name: /Add exercise from library/i })).toBeInTheDocument();
  });
});
