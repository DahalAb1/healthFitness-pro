/**
 * Tests the RestTimer dismiss flow in ActiveWorkoutPage.
 * This file mocks useActiveWorkout directly so we can control timerVisible.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockSetTimerVisible = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => vi.fn(), useSearchParams: () => [new URLSearchParams('source=template&id=1'), vi.fn()] };
});

vi.mock('@/hooks/useActiveWorkout', () => ({
  useActiveWorkout: () => ({
    exercises: [{ id: 1, name: 'Squat', sets: 3, reps: 10, imageUrl: '', muscleGroup: 'thighs', equipment: 'barbell' }],
    workoutName: 'Test',
    currentIndex: 0,
    loading: false,
    finishing: false,
    setLogs: [[]],
    timerVisible: true,
    setTimerVisible: mockSetTimerVisible,
    handleSetUpdate: vi.fn(),
    handleNext: vi.fn(),
    handleBack: vi.fn(),
    handleEnd: vi.fn(),
  }),
}));

vi.mock('@/utils/timerSettings', () => ({
  getDefaultRest: vi.fn(() => 60),
  saveDefaultRest: vi.fn(),
}));

vi.mock('@/components/common/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('@/components/common/Footer', () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock('@/components/activeWorkout/ExerciseCard', () => ({
  default: ({ exercise, variant }) =>
    exercise ? <div data-testid={`exercise-card-${variant}`}>{exercise.name}</div> : null,
}));

import ActiveWorkoutPage from '@/pages/ActiveWorkoutPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <ActiveWorkoutPage />
    </MemoryRouter>,
  );
}

describe('ActiveWorkoutPage — RestTimer dismiss', () => {
  beforeEach(() => {
    mockSetTimerVisible.mockReset();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders the RestTimer when timerVisible is true', () => {
    renderPage();
    expect(screen.getByText('Rest Timer')).toBeInTheDocument();
  });

  it('calls setTimerVisible(false) when the Skip button is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(mockSetTimerVisible).toHaveBeenCalledWith(false);
  });
});
