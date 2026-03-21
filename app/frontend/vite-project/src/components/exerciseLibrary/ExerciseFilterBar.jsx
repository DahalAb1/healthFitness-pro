const FILTERS = ['ALL', 'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'ABS'];

function ExerciseFilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="el-filter-bar">
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`el-filter-btn${activeFilter === f ? ' active' : ''}`}
          onClick={() => onFilterChange(f)}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

export default ExerciseFilterBar;
