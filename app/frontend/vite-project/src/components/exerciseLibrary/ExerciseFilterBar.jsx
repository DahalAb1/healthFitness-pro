import CategoryFilterBar from '../common/CategoryFilterBar';

const FILTERS = ['ALL', 'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'ABS'];

function ExerciseFilterBar({ activeFilter, onFilterChange }) {
  return (
    <CategoryFilterBar
      options={FILTERS}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
    />
  );
}

export default ExerciseFilterBar;
