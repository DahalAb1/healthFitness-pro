import { useState, useEffect } from 'react';
import { getTemplates } from '../../utils/api';

function TemplatesView() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    getTemplates().then((data) => setTemplates(data));
  }, []);

  return (
    <section className="wt-view-content active">
      <div className="wt-templates-grid" id="templates-container">
        {templates.map((template) => (
          <article key={template.id} className="wt-template-card">
            <h2>{template.name}</h2>
            <p>{template.description}</p>
            <span>{template.exercises.length} EXERCISES</span>
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
