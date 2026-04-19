function CategoryFilterBar({ options, activeFilter, onFilterChange, className = '' }) {
  return (
    <div className={`filter-bar ${className}`.trim()}>
      {options.map((opt) => (
        <button
          key={opt}
          className={`filter-btn${activeFilter === opt ? ' active' : ''}`}
          onClick={() => onFilterChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilterBar;
