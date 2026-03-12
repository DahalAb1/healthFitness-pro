import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ExerciseLibraryHero from '../components/exerciseLibrary/ExerciseLibraryHero';
import ExerciseFilterBar from '../components/exerciseLibrary/ExerciseFilterBar';
import ExerciseGrid from '../components/exerciseLibrary/ExerciseGrid';
import ExerciseModal from '../components/exerciseLibrary/ExerciseModal';
import '../styles/components/exerciseLibrary/exerciseLibrary.css';

function ExerciseLibraryPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedExercise, setSelectedExercise] = useState(null);

  return (
    <div className="el-page">
      <Navbar />
      <ExerciseLibraryHero />
      <ExerciseFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <ExerciseGrid
        exercises={[]}
        loading={false}
        onSelectExercise={setSelectedExercise}
      />
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
