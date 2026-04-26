import { useState, useEffect } from 'react';
import { getTemplates, getTemplateExercises } from '../utils/api';

export function useTemplatesView() {
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
      .catch(() => setExercises([]))
      .finally(() => setLoadingExercises(false));
  }

  function closeTemplate() {
    setSelectedTemplate(null);
  }

  return { templates, selectedTemplate, exercises, loadingExercises, openTemplate, closeTemplate };
}
