import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { getTemplateExercises, logWorkout, getExercises } from '../utils/api';
import ExerciseCard from '../components/activeWorkout/ExerciseCard';
import { normalizeTemplateExercise, normalizeCustomExercise } from '../components/activeWorkout/exerciseNormalizers';
import '../styles/components/active-workout/active-workout.css';

function ActiveWorkoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [exercises, setExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);

  const startedAt = useRef(Date.now());

  useEffect(() => {
    const source = searchParams.get('source');
    const id = Number(searchParams.get('id'));
    const name = sessionStorage.getItem('activeWorkoutName') || 'Workout';

    if (!source || !id) {
      navigate('/workout-template');
      return;
    }

    setWorkoutName(name);

    if (source === 'template') {
      getTemplateExercises(id)
        .then((data) => {
          setExercises((data.exercises || []).map(normalizeTemplateExercise));
        })
        .catch(() => setExercises([]))
        .finally(() => setLoading(false));
    } else if (source === 'custom') {
      const raw = sessionStorage.getItem('activeWorkoutExercises');
      const exs = raw ? JSON.parse(raw) : [];
      const normalized = exs.map(normalizeCustomExercise);
      setExercises(normalized);
      setLoading(false);

      // Enrich with images/muscle info by matching exercise names against the library
      getExercises('ALL')
        .then((libraryItems) => {
          if (!libraryItems || libraryItems.length === 0) return;
          setExercises((prev) =>
            prev.map((ex) => {
              if (ex.imageUrl) return ex;
              const nameLower = ex.name.trim().toLowerCase();
              const match =
                libraryItems.find((item) => item.name?.trim().toLowerCase() === nameLower) ||
                libraryItems.find((item) => {
                  const n = (item.name || '').trim().toLowerCase();
                  return n.includes(nameLower) || nameLower.includes(n);
                });
              if (!match) return ex;
              return {
                ...ex,
                imageUrl: match.image_url || '',
                muscleGroup: ex.muscleGroup || match.muscle_group || '',
                equipment: ex.equipment || match.equipment || '',
              };
            }),
          );
        })
        .catch(() => {}); // silently ignore — images are optional
    } else {
      navigate('/workout-template');
    }
  }, []);

  async function finish() {
    if (finishing) return;
    setFinishing(true);

    const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    const today = new Date().toISOString().split('T')[0];

    const exercisesToLog = exercises.map((ex) => ({
      exercise_name: ex.name.slice(0, 80),
      sets: Math.min(50, Math.max(1, Number(ex.sets) || 1)),
      reps: Math.min(200, Math.max(1, Number(ex.reps) || 1)),
      weight: 0,
    }));

    try {
      await logWorkout({
        user_id: 1,
        workout_date: today,
        duration_minutes: durationMinutes,
        exercises: exercisesToLog,
      });
    } catch (err) {
      console.error('Failed to log workout:', err);
      window.alert('Workout finished, but could not save to history. Is the backend running?');
    }

    sessionStorage.removeItem('activeWorkoutName');
    sessionStorage.removeItem('activeWorkoutExercises');

    navigate('/workout-history');
  }

  function handleNext() {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finish();
    }
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function handleEnd() {
    if (window.confirm('End this workout early? Your progress will be saved.')) {
      finish();
    }
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
          <ExerciseCard exercise={exercises[currentIndex]} variant="current" />
          <ExerciseCard exercise={exercises[currentIndex + 1]} variant="future" />
        </div>
      </section>

      <div className="aw-controls">
        <button
          className="aw-btn aw-btn-back"
          onClick={handleBack}
          disabled={currentIndex === 0}
        >
          Back
        </button>
        <button className="aw-btn aw-btn-end" onClick={handleEnd}>
          End Workout
        </button>
        <button
          className={`aw-btn aw-btn-next${isLast ? ' aw-btn-finish' : ''}`}
          onClick={handleNext}
          disabled={finishing}
        >
          {isLast ? 'Finish' : 'Next'}
        </button>
      </div>

      <Footer />
    </>
  );
}

export default ActiveWorkoutPage;
