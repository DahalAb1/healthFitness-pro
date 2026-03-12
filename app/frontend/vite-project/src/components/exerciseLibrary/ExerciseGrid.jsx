import ExerciseCard from './ExerciseCard';

function ExerciseGrid({ exercises, loading, onSelectExercise }) {
  if (loading) {
    return (
      <div className="el-loading">
        <div className="el-spinner" />
        <p>Loading exercises...</p>
      </div>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className="el-empty">
        <p>No exercises found. Try a different filter.</p>
      </div>
    );
  }

  return (
    <div className="el-grid-wrapper">
      <div className="el-grid">
        {exercises.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} onClick={onSelectExercise} />
        ))}
      </div>
    </div>
  );
}

export default ExerciseGrid;
