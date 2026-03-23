import { useState, useEffect } from 'react';
import { getTemplates, getTemplateExercises } from '../../utils/api';
import TemplateDetailPanel from './TemplateDetailPanel';

function TemplatesView() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  useEffect(() => {
    getTemplates().then((data) => setTemplates(Array.isArray(data) ? data : []));
  }, []);

  function openTemplate(template) {
    setSelectedTemplate(template);
    setExercises([]);
    setLoadingExercises(true);
    getTemplateExercises(template.id)
      .then((data) => setExercises(data.exercises || []))
      .finally(() => setLoadingExercises(false));
  }

  return (
    <section className="wt-view-content active">
      <div className="wt-templates-grid" id="templates-container">
        {templates.map((template) => (
          <article key={template.id} className="wt-template-card">
            <h2>{template.name}</h2>
            <p>{template.description}</p>
            <span>{template.exercises?.length ?? 0} EXERCISES</span>
            <button
              type="button"
              className="btn wt-btn-full"
              onClick={() => openTemplate(template)}
            >
              Use Template
            </button>
          </article>
        ))}
      </div>

      {selectedTemplate && (
        <TemplateDetailPanel
          template={selectedTemplate}
          exercises={exercises}
          loading={loadingExercises}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </section>
  );
}

export default TemplatesView;
