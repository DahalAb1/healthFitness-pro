import { Routes, Route } from 'react-router-dom';
import FrontPage from './pages/FrontPage';
import WorkoutTemplatePage from './pages/WorkoutTemplatePage';
import WorkoutHistoryPage from './pages/WorkoutHistoryPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<FrontPage />} />
      <Route path="/workout-template" element={<WorkoutTemplatePage />} />
      <Route path="/workout-history" element={<WorkoutHistoryPage />} />
      <Route path="/exercise-library" element={<ExerciseLibraryPage />} />
      <Route path="*" element={<FrontPage />} />
    </Routes>
  );
}

export default App;
