import { useTemplatesView } from '../../hooks/useTemplatesView';
import TemplateDetailPanel from './TemplateDetailPanel';
import WorkoutCard from '../common/WorkoutCard';

function TemplatesView() {
  const { templates, selectedTemplate, exercises, loadingExercises, openTemplate, closeTemplate } = useTemplatesView();

  return (
    <section className="wt-view-content active">
      <div className="wt-templates-grid" id="templates-container">
        {templates.map((template) => (
          <WorkoutCard
            key={template.id}
            title={template.name}
            subtitle={template.description}
            exerciseCount={template.exercises?.length ?? 0}
            actions={
              <button
                type="button"
                className="btn wt-btn-full"
                onClick={() => openTemplate(template)}
              >
                Use Template
              </button>
            }
          />
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
