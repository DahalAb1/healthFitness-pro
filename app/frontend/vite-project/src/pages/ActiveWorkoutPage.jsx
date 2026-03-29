import { useNavigate } from 'react-router-dom';
import ExerciseCarousel from '../components/activeWorkout/ExerciseCarousel';
import RestTimer from '../components/activeWorkout/RestTimer';
import WorkoutControls from '../components/activeWorkout/WorkoutControls';
import WorkoutHeader from '../components/activeWorkout/WorkoutHeader';
import WorkoutPageShell from '../components/activeWorkout/WorkoutPageShell';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import '../styles/components/active-workout/active-workout.css';

function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const {
    exercises, workoutName, currentIndex, loading, finishing,
    setLogs, timerVisible, setTimerVisible,
    handleSetUpdate, handleNext, handleBack, handleEnd,
  } = useActiveWorkout();

  const total = exercises.length;

  if (loading) {
    return (
      <WorkoutPageShell>
        <div className="aw-loading">Loading workout...</div>
      </WorkoutPageShell>
    );
  }

  if (total === 0) {
    return (
      <WorkoutPageShell>
        <div className="aw-loading">
          No exercises found.{' '}
          <button className="btn" onClick={() => navigate('/workout-template')}>
            Go back
          </button>
        </div>
      </WorkoutPageShell>
    );
  }

  return (
    <WorkoutPageShell>
      <WorkoutHeader workoutName={workoutName} currentIndex={currentIndex} total={total} />
      <ExerciseCarousel
        exercises={exercises}
        currentIndex={currentIndex}
        setLogs={setLogs}
        onSetUpdate={handleSetUpdate}
      />
      {timerVisible && <RestTimer onDismiss={() => setTimerVisible(false)} />}
      <WorkoutControls
        currentIndex={currentIndex}
        total={total}
        finishing={finishing}
        onBack={handleBack}
        onEnd={handleEnd}
        onNext={handleNext}
      />
    </WorkoutPageShell>
  );
}

export default ActiveWorkoutPage;
