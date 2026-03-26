import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ExerciseCard from '../components/activeWorkout/ExerciseCard';
import WorkoutHeader from '../components/activeWorkout/WorkoutHeader';
import WorkoutControls from '../components/activeWorkout/WorkoutControls';
import RestTimer from '../components/activeWorkout/RestTimer';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import '../styles/components/active-workout/active-workout.css';

function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const [timerVisible, setTimerVisible] = useState(false);
  const {
    exercises,
    workoutName,
    currentIndex,
    loading,
    finishing,
    setLogs,
    handleNext,
    handleBack,
    handleEnd,
    updateSetLog,
  } = useActiveWorkout();

  function handleSetUpdate(exerciseIdx, setIdx, field, value) {
    if (field === 'done' && value === true) setTimerVisible(true);
    updateSetLog(exerciseIdx, setIdx, field, value);
  }

  const total = exercises.length;
  const isLast = currentIndex === total - 1;

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

      <WorkoutHeader
        workoutName={workoutName}
        currentIndex={currentIndex}
        total={total}
      />

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
        onBack={handleBack}
        onEndWorkout={handleEnd}
        onNext={handleNext}
        isBackDisabled={currentIndex === 0}
        isLast={isLast}
        finishing={finishing}
      />

      <Footer />
    </>
  );
}

export default ActiveWorkoutPage;
