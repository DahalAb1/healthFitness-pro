import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ExerciseLibraryHero from '../components/exerciseLibrary/ExerciseLibraryHero';
import ExerciseFilterBar from '../components/exerciseLibrary/ExerciseFilterBar';
import ExerciseGrid from '../components/exerciseLibrary/ExerciseGrid';
import ExerciseModal from '../components/exerciseLibrary/ExerciseModal';
import { getExercises } from '../utils/api';
import '../styles/components/exerciseLibrary/exerciseLibrary.css';

function ExerciseLibraryPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getExercises(activeFilter)
      .then((data) => {
        setExercises(data);
      })
      .catch(() => {
        setError('Failed to load exercises. Make sure the backend is running.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeFilter]);

  return (
    <div className="el-page">
      <Navbar />
      <ExerciseLibraryHero />
      <ExerciseFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      {error
        ? <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</p>
        : <ExerciseGrid exercises={exercises} loading={loading} onSelectExercise={setSelectedExercise} />
      }
      <Footer />
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}

export default ExerciseLibraryPage;
