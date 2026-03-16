function WorkoutViewSwitcher({ activeView, setActiveView }) {
  return (
    <div className="wt-view-switcher">
      <button
        type="button"
        className={`wt-switch-btn ${activeView === 'templates' ? 'active' : ''}`}
        onClick={() => setActiveView('templates')}
      >
        TEMPLATES
      </button>
      <button
        type="button"
        className={`wt-switch-btn ${activeView === 'custom' ? 'active' : ''}`}
        onClick={() => setActiveView('custom')}
      >
        CUSTOM CREATOR
      </button>
    </div>
  );
}

export default WorkoutViewSwitcher;
