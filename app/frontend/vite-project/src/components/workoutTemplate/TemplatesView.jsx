

// these are hardcoded for now, will be fetched from backend later

const templates = [
  {
    id: 'full-body-strength',
    title: 'Full Body Strength',
    description:
      'A balanced routine targeting all major muscle groups for maximum efficiency.',
    exerciseCount: 8,
  },
  {
    id: 'high-intensity-cardio',
    title: 'High Intensity Cardio',
    description:
      'Short rest periods and explosive movements to boost endurance.',
    exerciseCount: 6,
  },
];

function TemplatesView() {
  return (
    <section className="wt-view-content active">
      <div className="wt-templates-grid" id="templates-container">
        {templates.map((template) => (
          <article key={template.id} className="wt-template-card">
            <h2>{template.title}</h2>
            <p>{template.description}</p>
            <span>{template.exerciseCount} EXERCISES</span>
            <button type="button" className="btn wt-btn-full">
              Use Template
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TemplatesView;
