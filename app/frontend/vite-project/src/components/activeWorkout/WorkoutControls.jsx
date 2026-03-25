function WorkoutControls({ onBack, onEndWorkout, onNext, isBackDisabled, isLast, finishing }) {
  return (
    <div className="aw-controls">
      <button
        className="aw-btn aw-btn-back"
        onClick={onBack}
        disabled={isBackDisabled}
      >
        Back
      </button>
      <button className="aw-btn aw-btn-end" onClick={onEndWorkout}>
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
