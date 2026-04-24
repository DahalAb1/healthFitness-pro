import ModalShell from '../common/ModalShell';

function ExerciseModal({ exercise, onClose }) {
  const steps = Array.isArray(exercise.description)
    ? exercise.description
    : exercise.description
      ? [exercise.description]
      : ['No instructions available for this exercise.'];

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={exercise.name}
      className="el-modal-content"
      closeAriaLabel="Close exercise detail"
    >
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
    </ModalShell>
  );
}

export default ExerciseModal;
