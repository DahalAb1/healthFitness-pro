// Jest setup file for global test configuration
global.exercises = [];

try {
  // Require the script so its functions/variables are available in tests
  const path = require('path');
  const script = require(path.resolve(__dirname, '../app/frontend/script.js'));
  if (script) {
    global.loadExercises = script.loadExercises;
    global.loadExerciseById = script.loadExerciseById;
    global.loadTemplates = script.loadTemplates;
    global.loadTemplateById = script.loadTemplateById;
    global.exercises = script.exercises;
  }
} catch (e) {
  console.error('Failed to load script.js:', e);
}
