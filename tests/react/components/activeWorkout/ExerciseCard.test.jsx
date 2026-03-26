import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExerciseCard from '@/components/activeWorkout/ExerciseCard';

const mockExercise = {
  name: 'Bench Press',
  sets: 3,
  reps: 10,
  muscleGroup: 'chest',
  equipment: 'barbell',
  imageUrl: '',
  rest: '60s',
};

const mockSetLogs = [
  { weight: '', reps: '', done: false },
  { weight: '', reps: '', done: false },
  { weight: '135', reps: '8', done: true },
];

describe('ExerciseCard (Active Workout)', () => {
  it('renders an empty placeholder when exercise is null', () => {
    const { container } = render(<ExerciseCard exercise={null} variant="current" />);
    expect(container.querySelector('.aw-card-empty')).toBeInTheDocument();
  });

  it('renders the exercise name', () => {
    render(
      <ExerciseCard exercise={mockExercise} variant="current" setLogs={mockSetLogs} onSetUpdate={vi.fn()} />,
    );
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
  });

  it('renders sets × reps text', () => {
    render(
      <ExerciseCard exercise={mockExercise} variant="current" setLogs={mockSetLogs} onSetUpdate={vi.fn()} />,
    );
    expect(screen.getByText('3 sets × 10 reps')).toBeInTheDocument();
  });

  it('renders the muscle group badge', () => {
    render(
      <ExerciseCard exercise={mockExercise} variant="current" setLogs={mockSetLogs} onSetUpdate={vi.fn()} />,
    );
    expect(screen.getByText('chest')).toBeInTheDocument();
  });

  it('renders the equipment badge', () => {
    render(
      <ExerciseCard exercise={mockExercise} variant="current" setLogs={mockSetLogs} onSetUpdate={vi.fn()} />,
    );
    expect(screen.getByText('barbell')).toBeInTheDocument();
  });

  it('renders rest info', () => {
    render(
      <ExerciseCard exercise={mockExercise} variant="current" setLogs={mockSetLogs} onSetUpdate={vi.fn()} />,
    );
    expect(screen.getByText('Rest: 60s')).toBeInTheDocument();
  });

  it('renders the set logger table for variant="current" with setLogs', () => {
    render(
      <ExerciseCard exercise={mockExercise} variant="current" setLogs={mockSetLogs} onSetUpdate={vi.fn()} />,
    );
    expect(screen.getByText('Set')).toBeInTheDocument();
    expect(screen.getByText('Weight (lbs)')).toBeInTheDocument();
    expect(screen.getByText('Reps Done')).toBeInTheDocument();
  });

  it('renders a table row for each set log entry', () => {
    render(
      <ExerciseCard exercise={mockExercise} variant="current" setLogs={mockSetLogs} onSetUpdate={vi.fn()} />,
    );
    // 3 rows: set numbers 1, 2, 3
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not render the set logger when variant is not "current"', () => {
    render(
      <ExerciseCard exercise={mockExercise} variant="next" setLogs={mockSetLogs} onSetUpdate={vi.fn()} />,
    );
    expect(screen.queryByText('Weight (lbs)')).not.toBeInTheDocument();
  });

  it('does not render the set logger when setLogs is not provided', () => {
    render(<ExerciseCard exercise={mockExercise} variant="current" onSetUpdate={vi.fn()} />);
    expect(screen.queryByText('Weight (lbs)')).not.toBeInTheDocument();
  });

  it('calls onSetUpdate with correct args when a check button is clicked', () => {
    const onSetUpdate = vi.fn();
    render(
      <ExerciseCard exercise={mockExercise} variant="current" setLogs={mockSetLogs} onSetUpdate={onSetUpdate} />,
    );
    const undoneButtons = screen.getAllByTitle('Mark complete');
    fireEvent.click(undoneButtons[0]);
    expect(onSetUpdate).toHaveBeenCalledWith(0, 'done', true);
  });

  it('shows "Undo" title on a completed set button', () => {
    render(
      <ExerciseCard exercise={mockExercise} variant="current" setLogs={mockSetLogs} onSetUpdate={vi.fn()} />,
    );
    expect(screen.getByTitle('Undo')).toBeInTheDocument();
  });

  it('renders an img placeholder div when imageUrl is empty', () => {
    const { container } = render(
      <ExerciseCard exercise={mockExercise} variant="current" setLogs={mockSetLogs} onSetUpdate={vi.fn()} />,
    );
    expect(container.querySelector('.aw-card-img-placeholder')).toBeInTheDocument();
  });

  it('renders an img element when imageUrl is a non-empty string', () => {
    const ex = { ...mockExercise, imageUrl: 'http://test.com/img.gif' };
    render(
      <ExerciseCard exercise={ex} variant="current" setLogs={mockSetLogs} onSetUpdate={vi.fn()} />,
    );
    expect(screen.getByAltText('Bench Press')).toBeInTheDocument();
  });
});
