function WorkoutControls({ onBack, onEnd, onNext, currentIndex, total, finishing }) {
  const isLast = currentIndex === total - 1;

  return (
    <div className="aw-controls">
      <button
        className="aw-btn aw-btn-back"
        onClick={onBack}
        disabled={currentIndex === 0}
      >
        Back
      </button>
      <button className="aw-btn aw-btn-end" onClick={onEnd}>
        End Workout
      </button>
      <button
        className={`aw-btn aw-btn-next${isLast ? ' aw-btn-finish' : ''}`}
        onClick={onNext}
        disabled={finishing}
      >
        {isLast ? 'Finish' : 'Next'}
      </button>
    </div>
  );
}

export default WorkoutControls;
