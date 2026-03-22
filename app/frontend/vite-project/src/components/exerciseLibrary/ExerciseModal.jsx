import { useEffect } from 'react';

function ExerciseModal({ exercise, onClose }) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const steps = Array.isArray(exercise.description)
    ? exercise.description
    : exercise.description
      ? [exercise.description]
      : ['No instructions available for this exercise.'];

  return (
    <div
      className="el-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="el-modal-name"
    >
      <div className="el-modal-overlay" onClick={onClose} />
      <div className="el-modal-content">
        <button
          className="el-modal-close"
          onClick={onClose}
          aria-label="Close exercise detail"
        >
          &times;
        </button>
        <img
          className="el-modal-image"
          src={exercise.image_url}
          alt={exercise.name}
          onError={(e) => { e.currentTarget.style.background = '#222'; }}
        />
        <div className="el-modal-body">
          <h2 id="el-modal-name" className="el-modal-name">{exercise.name}</h2>
          <div className="el-modal-badges">
            {exercise.muscle_group && (
              <span className="el-badge el-badge-muscle">{exercise.muscle_group}</span>
            )}
            {exercise.equipment && (
              <span className="el-badge el-badge-equipment">{exercise.equipment}</span>
            )}
          </div>
          <p className="el-modal-section-label">Instructions</p>
          <ol className="el-modal-instructions">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default ExerciseModal;
