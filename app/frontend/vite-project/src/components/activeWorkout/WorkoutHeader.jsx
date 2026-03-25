function WorkoutHeader({ workoutName, currentIndex, total }) {
  return (
    <header className="aw-header">
      <h1 className="aw-header-title">{workoutName}</h1>
      <p className="aw-header-progress">
        Exercise {currentIndex + 1} of {total}
      </p>
      <div className="aw-progress-bar">
        <div
          className="aw-progress-fill"
          style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
        />
      </div>
    </header>
  );
}

export default WorkoutHeader;
