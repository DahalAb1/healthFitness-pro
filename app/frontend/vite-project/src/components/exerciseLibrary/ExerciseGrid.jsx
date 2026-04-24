import AsyncState from '../common/AsyncState';
import ExerciseCard from './ExerciseCard';

function ExerciseGrid({ exercises, loading, onSelectExercise }) {
  return (
    <AsyncState
      loading={loading}
      loadingText="Loading exercises..."
      empty={!loading && (!exercises || exercises.length === 0)}
      emptyText="No exercises found. Try a different filter."
    >
      <div className="el-grid-wrapper">
        <div className="el-grid">
          {exercises && exercises.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} onClick={onSelectExercise} />
          ))}
        </div>
      </div>
    </AsyncState>
  );
}

export default ExerciseGrid;
