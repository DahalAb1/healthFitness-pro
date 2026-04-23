import ModalShell from '../common/ModalShell';
import CategoryFilterBar from '../common/CategoryFilterBar';
import ExerciseBadges from '../common/ExerciseBadges';
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
    <ModalShell
      onClose={onClose}
      ariaLabel="Add From Exercise Library"
      className="wt-library-modal"
      backdropClassName="wt-library-overlay"
    >
        <div className="wt-library-header">
          <h3>Add From Exercise Library</h3>
        </div>

        <div className="wt-library-controls">
          <input
            type="text"
            className="wt-library-search"
            placeholder="Search exercises..."
            value={librarySearch}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <CategoryFilterBar
            options={BODY_PARTS}
            activeFilter={libraryFilter}
            onFilterChange={onFilterChange}
            className="wt-library-filter-bar"
          />
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
                <ExerciseBadges
                  muscleGroup={ex.muscle_group}
                  equipment={ex.equipment}
                  badgeClass="el-badge"
                  className="wt-library-item-badges"
                />
              </div>
            </button>
          ))}
        </div>
    </ModalShell>
  );
}

export default ExerciseLibraryModal;
