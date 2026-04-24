import { useNavigate } from 'react-router-dom';
import ExerciseCarousel from '../components/activeWorkout/ExerciseCarousel';
import RestTimer from '../components/activeWorkout/RestTimer';
import WorkoutControls from '../components/activeWorkout/WorkoutControls';
import WorkoutHeader from '../components/activeWorkout/WorkoutHeader';
import WorkoutPageShell from '../components/activeWorkout/WorkoutPageShell';
import AsyncState from '../components/common/AsyncState';
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

  return (
    <WorkoutPageShell>
      <AsyncState
        loading={loading}
        loadingText="Loading workout..."
        empty={!loading && total === 0}
        emptyText={
          <>
            No exercises found.{' '}
            <button className="btn" onClick={() => navigate('/workout-template')}>
              Go back
            </button>
          </>
        }
        className="aw-loading"
      >
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
      </AsyncState>
    </WorkoutPageShell>
  );
}

export default ActiveWorkoutPage;
