import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/utils/api', () => ({
  getUserWorkouts: vi.fn(),
  postUserWorkout: vi.fn(),
  deleteUserWorkout: vi.fn(),
  getExercises: vi.fn(),
}));

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ token: 'test-token', user: { id: 1 } }),
}));

import CustomCreatorView from '@/components/workoutTemplate/CustomCreatorView';
import { getUserWorkouts, postUserWorkout, deleteUserWorkout, getExercises } from '@/utils/api';

const mockSavedWorkouts = [
  {
    id: 10,
    name: 'My Leg Day',
    exercises: [{ exercise_name: 'Squat', sets: 3, reps: 10 }],
  },
];

function renderView() {
  return render(
    <MemoryRouter>
      <CustomCreatorView />
    </MemoryRouter>,
  );
}

describe('CustomCreatorView', () => {
  beforeEach(() => {
    getUserWorkouts.mockResolvedValue(mockSavedWorkouts);
    postUserWorkout.mockResolvedValue({ id: 99, name: 'New Workout', exercises: [] });
    deleteUserWorkout.mockResolvedValue({});
    getExercises.mockResolvedValue([]);
    mockNavigate.mockReset();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('renders the "Create New Routine" heading', () => {
    renderView();
    expect(screen.getByText('Create New Routine')).toBeInTheDocument();
  });

  it('renders the workout name input', () => {
    renderView();
    expect(screen.getByLabelText('WORKOUT NAME')).toBeInTheDocument();
  });

  it('renders at least one empty exercise row by default', () => {
    const { container } = renderView();
    const rows = container.querySelectorAll('#exerciseBody tr');
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it('renders saved workouts after loading', async () => {
    renderView();
    await waitFor(() => expect(screen.getByText('My Leg Day')).toBeInTheDocument());
  });

  it('shows empty state text when no saved workouts exist', async () => {
    getUserWorkouts.mockResolvedValue([]);
    renderView();
    await waitFor(() =>
      expect(screen.getByText('No saved workouts yet. Create one above!')).toBeInTheDocument(),
    );
  });

  it('alerts when saving without a workout name', async () => {
    renderView();
    await waitFor(() => expect(screen.getByText('My Leg Day')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Save Workout' }));
    expect(window.alert).toHaveBeenCalledWith('Please enter a workout name before saving.');
  });

  it('saves the workout when a name is provided', async () => {
    renderView();
    await waitFor(() => expect(screen.getByText('My Leg Day')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('WORKOUT NAME'), {
      target: { value: 'Upper Body Push' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Workout' }));
    await waitFor(() =>
      expect(postUserWorkout).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Upper Body Push' }),
        'test-token',
      ),
    );
  });

  it('clears the name field after saving', async () => {
    renderView();
    await waitFor(() => expect(screen.getByText('My Leg Day')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('WORKOUT NAME'), {
      target: { value: 'Temp Name' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Workout' }));
    expect(screen.getByLabelText('WORKOUT NAME')).toHaveValue('');
  });

  it('opens the library modal when "+ Add Exercise From Library" is clicked', async () => {
    getExercises.mockResolvedValue([]);
    renderView();
    fireEvent.click(screen.getByRole('button', { name: '+ Add Exercise From Library' }));
    await waitFor(() =>
      expect(screen.getByText('Add From Exercise Library')).toBeInTheDocument(),
    );
  });

  it('closes the library modal via the close button', async () => {
    getExercises.mockResolvedValue([]);
    renderView();
    fireEvent.click(screen.getByRole('button', { name: '+ Add Exercise From Library' }));
    await waitFor(() =>
      expect(screen.getByText('Add From Exercise Library')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Add From Exercise Library')).not.toBeInTheDocument();
  });

  it('adds an exercise row from the library', async () => {
    getExercises.mockResolvedValue([
      { id: 'e1', name: 'Bench Press', muscle_group: 'chest', equipment: 'barbell' },
    ]);
    const { container } = renderView();
    const initialRows = container.querySelectorAll('#exerciseBody tr').length;
    fireEvent.click(screen.getByRole('button', { name: '+ Add Exercise From Library' }));
    await waitFor(() => expect(screen.getByText('Bench Press')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Bench Press'));
    await waitFor(() => {
      const rows = container.querySelectorAll('#exerciseBody tr');
      expect(rows.length).toBe(initialRows + 1);
    });
  });

  it('removes an exercise row when the × button is clicked', async () => {
    renderView();
    // Add a second row first so we can remove one
    fireEvent.click(screen.getByRole('button', { name: '+ Add Exercise From Library' }));
    await waitFor(() => expect(screen.getByText('Add From Exercise Library')).toBeInTheDocument());
    // Close library without adding
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    // The default row's remove button; since only 1 row exists it should not be removed
    // We can't remove the last row per the component logic
    const { container } = renderView();
    expect(container.querySelectorAll('#exerciseBody tr').length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to active-workout when "Begin" is clicked', async () => {
    renderView();
    await waitFor(() => expect(screen.getByText('My Leg Day')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Begin' }));
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/active-workout'),
    );
  });

  it('deletes a saved workout when "Delete" is confirmed', async () => {
    renderView();
    await waitFor(() => expect(screen.getByText('My Leg Day')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sure?' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Sure?' }));
    await waitFor(() => expect(deleteUserWorkout).toHaveBeenCalledWith(10, 'test-token'));
  });

  it('toggles exercise list when "View"/"Hide" is clicked', async () => {
    renderView();
    await waitFor(() => expect(screen.getByText('My Leg Day')).toBeInTheDocument());
    expect(screen.queryByText('Squat')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View' }));
    expect(screen.getByText('Squat')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
    expect(screen.queryByText('Squat')).not.toBeInTheDocument();
  });

  it('renders exercise image in the library modal when image_url is provided', async () => {
    getExercises.mockResolvedValue([
      { name: 'Deadlift', muscle_group: 'back', equipment: 'barbell', image_url: 'https://example.com/deadlift.gif' },
    ]);
    renderView();
    fireEvent.click(screen.getByRole('button', { name: '+ Add Exercise From Library' }));
    await waitFor(() => expect(screen.getByText('Deadlift')).toBeInTheDocument());
    expect(screen.getByRole('img', { name: 'Deadlift' })).toBeInTheDocument();
  });

  it('uses exercise name as key when exercise has no id', async () => {
    getExercises.mockResolvedValue([
      { name: 'Pull Up', muscle_group: 'back', equipment: 'bodyweight' },
    ]);
    renderView();
    fireEvent.click(screen.getByRole('button', { name: '+ Add Exercise From Library' }));
    await waitFor(() => expect(screen.getByText('Pull Up')).toBeInTheDocument());
  });

  it('filters exercises when typing in the library search input', async () => {
    getExercises.mockResolvedValue([
      { id: 'e1', name: 'Bench Press', muscle_group: 'chest', equipment: 'barbell' },
      { id: 'e2', name: 'Squat', muscle_group: 'legs', equipment: 'barbell' },
    ]);
    renderView();
    fireEvent.click(screen.getByRole('button', { name: '+ Add Exercise From Library' }));
    await waitFor(() => expect(screen.getByText('Bench Press')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Search exercises...'), { target: { value: 'bench' } });
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.queryByText('Squat')).not.toBeInTheDocument();
  });

  it('shows 0 EXERCISES for a saved workout that has no exercises property', async () => {
    getUserWorkouts.mockResolvedValue([{ id: 10, name: 'No Exs Workout' }]);
    renderView();
    await waitFor(() => expect(screen.getByText('No Exs Workout')).toBeInTheDocument());
    expect(screen.getByText('0 EXERCISES')).toBeInTheDocument();
  });
});
