import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ExerciseLibraryHero from '../components/exerciseLibrary/ExerciseLibraryHero';
import ExerciseFilterBar from '../components/exerciseLibrary/ExerciseFilterBar';
import ExerciseGrid from '../components/exerciseLibrary/ExerciseGrid';
import ExerciseModal from '../components/exerciseLibrary/ExerciseModal';
import { useExerciseLibrary } from '../hooks/useExerciseLibrary';
import '../styles/components/exerciseLibrary/exerciseLibrary.css';

function ExerciseLibraryPage() {
  const {
    activeFilter, setActiveFilter,
    selectedExercise, setSelectedExercise,
    exercises, loading, error,
  } = useExerciseLibrary();

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
