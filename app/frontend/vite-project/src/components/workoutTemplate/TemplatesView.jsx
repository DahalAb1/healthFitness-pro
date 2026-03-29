import { useTemplatesView } from '../../hooks/useTemplatesView';
import TemplateDetailPanel from './TemplateDetailPanel';

function TemplatesView() {
  const { templates, selectedTemplate, exercises, loadingExercises, openTemplate, closeTemplate } = useTemplatesView();

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
          onClose={() => closeTemplate()}
        />
      )}
    </section>
  );
}

export default TemplatesView;
