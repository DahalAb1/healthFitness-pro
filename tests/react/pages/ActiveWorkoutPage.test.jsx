import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams('source=template&id=1');

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, vi.fn()],
  };
});

vi.mock('@/utils/api', () => ({
  getTemplateExercises: vi.fn(),
  getExercises: vi.fn(),
  logWorkout: vi.fn(),
}));

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

vi.mock('@/components/common/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('@/components/common/Footer', () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock('@/components/activeWorkout/ExerciseCard', () => ({
  default: ({ exercise, variant }) =>
    exercise ? <div data-testid={`exercise-card-${variant}`}>{exercise.name}</div> : null,
}));

import ActiveWorkoutPage from '@/pages/ActiveWorkoutPage';
import { getTemplateExercises, getExercises, logWorkout } from '@/utils/api';

const mockExercises = [
  { id: 1, name: 'Bench Press', sets: 3, reps: 10, imageUrl: '', muscleGroup: 'chest', equipment: 'barbell' },
  { id: 2, name: 'Squat', sets: 4, reps: 8, imageUrl: '', muscleGroup: 'thighs', equipment: 'barbell' },
];

// normalizeTemplateExercise reads: details.name, target_sets, target_reps
const rawTemplateExercises = [
  { exercise_id: 1, target_sets: 3, target_reps: 10, details: { name: 'Bench Press', image_url: '', muscle_group: 'chest', equipment: 'barbell' } },
  { exercise_id: 2, target_sets: 4, target_reps: 8, details: { name: 'Squat', image_url: '', muscle_group: 'thighs', equipment: 'barbell' } },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <ActiveWorkoutPage />
    </MemoryRouter>,
  );
}

describe('ActiveWorkoutPage', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams('source=template&id=1');
    mockNavigate.mockReset();
    getTemplateExercises.mockResolvedValue({ exercises: rawTemplateExercises });
    getExercises.mockResolvedValue([]);
    logWorkout.mockResolvedValue({});
    sessionStorage.setItem('activeWorkoutName', 'Test Workout');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders Navbar and Footer', async () => {
    renderPage();
    await waitFor(() => expect(screen.queryByText('Loading workout...')).not.toBeInTheDocument());
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    getTemplateExercises.mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Loading workout...')).toBeInTheDocument();
  });

  it('shows workout name after loading', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Test Workout')).toBeInTheDocument());
  });

  it('shows exercise progress text', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Exercise 1 of 2')).toBeInTheDocument(),
    );
  });

  it('renders the current exercise card', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('exercise-card-current')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('exercise-card-current')).toHaveTextContent('Bench Press');
  });

  it('navigates to next exercise when "Next" is clicked', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(screen.getByText('Exercise 2 of 2')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('exercise-card-current')).toHaveTextContent('Squat');
  });

  it('Back button is disabled on the first exercise', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
  });

  it('Back button is enabled after navigating forward', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Back' })).not.toBeDisabled(),
    );
  });

  it('shows "Finish" on the last exercise instead of "Next"', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument());
  });

  it('calls logWorkout and navigates to history on Finish', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    await waitFor(() => expect(logWorkout).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/history');
  });

  it('calls logWorkout and navigates when "End Workout" is confirmed', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'End Workout' })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'End Workout' }));
    await waitFor(() => expect(logWorkout).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/history');
  });

  it('redirects to /workout-template when source param is missing', async () => {
    mockSearchParams = new URLSearchParams('');
    renderPage();
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('/workout-template'),
    );
  });

  it('loads exercises from sessionStorage for custom source', async () => {
    mockSearchParams = new URLSearchParams('source=custom&id=5');
    sessionStorage.setItem(
      'activeWorkoutExercises',
      JSON.stringify([{ exercise_name: 'Deadlift', sets: 3, reps: 5, exercise_id: null }]),
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId('exercise-card-current')).toHaveTextContent('Deadlift'),
    );
  });

  it('shows "No exercises found" when template has no exercises', async () => {
    getTemplateExercises.mockResolvedValue({ exercises: [] });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/no exercises found/i)).toBeInTheDocument(),
    );
  });
});
