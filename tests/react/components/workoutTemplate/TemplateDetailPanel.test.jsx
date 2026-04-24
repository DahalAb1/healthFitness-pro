import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import TemplateDetailPanel from '@/components/workoutTemplate/TemplateDetailPanel';

const mockTemplate = {
  id: 1,
  name: 'Push Day',
  description: 'Chest, shoulders, and triceps.',
};

const mockExercises = [
  {
    details: { name: 'Bench Press', muscle_group: 'chest', equipment: 'barbell', image_url: '' },
    target_sets: 4,
    target_reps: 8,
  },
  {
    details: { name: 'Overhead Press', muscle_group: 'shoulders', equipment: 'dumbbell', image_url: '' },
    target_sets: 3,
    target_reps: 10,
  },
];

function renderPanel(overrides = {}) {
  const props = {
    template: mockTemplate,
    exercises: mockExercises,
    loading: false,
    onClose: vi.fn(),
    ...overrides,
  };
  return render(
    <MemoryRouter>
      <TemplateDetailPanel {...props} />
    </MemoryRouter>,
  );
}

describe('TemplateDetailPanel', () => {
  it('renders the template name', () => {
    renderPanel();
    expect(screen.getByText('Push Day')).toBeInTheDocument();
  });

  it('renders the template description', () => {
    renderPanel();
    expect(screen.getByText('Chest, shoulders, and triceps.')).toBeInTheDocument();
  });

  it('renders each exercise name', () => {
    renderPanel();
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Overhead Press')).toBeInTheDocument();
  });

  it('renders sets × reps for each exercise', () => {
    renderPanel();
    expect(screen.getByText('4 sets × 8 reps')).toBeInTheDocument();
    expect(screen.getByText('3 sets × 10 reps')).toBeInTheDocument();
  });

  it('renders exercise muscle group and equipment meta', () => {
    renderPanel();
    expect(screen.getByText('chest')).toBeInTheDocument();
    expect(screen.getByText('barbell')).toBeInTheDocument();
    expect(screen.getByText('shoulders')).toBeInTheDocument();
    expect(screen.getByText('dumbbell')).toBeInTheDocument();
  });

  it('shows a loading message when loading is true', () => {
    renderPanel({ loading: true, exercises: [] });
    expect(screen.getByText('Loading exercises...')).toBeInTheDocument();
  });

  it('does not show exercise list while loading', () => {
    renderPanel({ loading: true, exercises: mockExercises });
    expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();
  });

  it('renders the Begin Workout button', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: 'Begin Workout' })).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    renderPanel({ onClose });
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the overlay backdrop is clicked', () => {
    const onClose = vi.fn();
    renderPanel({ onClose });
    fireEvent.click(document.querySelector('.wt-detail-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when the inner panel is clicked', () => {
    const onClose = vi.fn();
    renderPanel({ onClose });
    fireEvent.click(document.querySelector('.wt-detail-panel'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
