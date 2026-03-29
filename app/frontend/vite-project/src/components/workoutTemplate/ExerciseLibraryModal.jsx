import { BODY_PARTS } from '../../hooks/useCustomCreatorView';

function ExerciseLibraryModal({
  onClose,
  libraryFilter,
  onFilterChange,
  librarySearch,
  onSearchChange,
  filteredLibrary,
  libraryLoading,
  onSelect,
}) {
  return (
    <div className="wt-library-overlay" onClick={onClose}>
      <div className="wt-library-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wt-library-header">
          <h3>Add From Exercise Library</h3>
          <button
            type="button"
            className="wt-detail-close"
            onClick={onClose}
            aria-label="Close library"
          >
            ✕
          </button>
        </div>

        <div className="wt-library-controls">
          <input
            type="text"
            className="wt-library-search"
            placeholder="Search exercises..."
            value={librarySearch}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <select
            className="wt-library-filter"
            value={libraryFilter}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            {BODY_PARTS.map((bp) => (
              <option key={bp} value={bp}>{bp}</option>
            ))}
          </select>
        </div>

        <div className="wt-library-list">
          {libraryLoading && <p className="wt-detail-loading">Loading exercises...</p>}
          {!libraryLoading && filteredLibrary.length === 0 && (
            <p className="wt-detail-loading">No exercises found.</p>
          )}
          {filteredLibrary.map((ex) => (
            <button
              key={ex.id || ex.name}
              type="button"
              className="wt-library-item"
              onClick={() => onSelect(ex)}
            >
              {ex.image_url && (
                <img src={ex.image_url} alt={ex.name} className="wt-library-item-img" />
              )}
              <div className="wt-library-item-info">
                <strong>{ex.name}</strong>
                {(ex.muscle_group || ex.equipment) && (
                  <span>{[ex.muscle_group, ex.equipment].filter(Boolean).join(' · ')}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExerciseLibraryModal;
