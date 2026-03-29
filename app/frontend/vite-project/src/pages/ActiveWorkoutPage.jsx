import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ExerciseCard from '../components/activeWorkout/ExerciseCard';
import RestTimer from '../components/activeWorkout/RestTimer';
import WorkoutControls from '../components/activeWorkout/WorkoutControls';
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
      <>
        <Navbar />
        <div className="aw-loading">Loading workout...</div>
        <Footer />
      </>
    );
  }

  if (total === 0) {
    return (
      <>
        <Navbar />
        <div className="aw-loading">
          No exercises found.{' '}
          <button className="btn" onClick={() => navigate('/workout-template')}>
            Go back
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <header className="aw-header">
        <h1 className="aw-header-title">{workoutName}</h1>
        <p className="aw-header-progress">
          Exercise {currentIndex + 1} of {total}
        </p>
        <div className="aw-progress-bar">
          <div
            className="aw-progress-fill"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </header>

      <section className="aw-carousel">
        <div className="aw-carousel-track">
          <ExerciseCard exercise={exercises[currentIndex - 1]} variant="past" />
          <ExerciseCard
            exercise={exercises[currentIndex]}
            variant="current"
            setLogs={setLogs[currentIndex]}
            onSetUpdate={(setIdx, field, value) => handleSetUpdate(currentIndex, setIdx, field, value)}
          />
          <ExerciseCard exercise={exercises[currentIndex + 1]} variant="future" />
        </div>
      </section>

      {timerVisible && <RestTimer onDismiss={() => setTimerVisible(false)} />}

      <WorkoutControls
        currentIndex={currentIndex}
        total={total}
        finishing={finishing}
        onBack={handleBack}
        onEnd={handleEnd}
        onNext={handleNext}
      />

      <Footer />
    </>
  );
}

export default ActiveWorkoutPage;
