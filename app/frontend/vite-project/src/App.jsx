import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import FrontPage from './pages/FrontPage';
import WorkoutTemplatePage from './pages/WorkoutTemplatePage';
import WorkoutHistoryPage from './pages/WorkoutHistoryPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import ActiveWorkoutPage from './pages/ActiveWorkoutPage';
import NutritionPage from './pages/NutritionPage';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<FrontPage />} />
      <Route path="/workout-template" element={<WorkoutTemplatePage />} />
      <Route path="/workout-history" element={<WorkoutHistoryPage />} />
      <Route path="/exercise-library" element={<ExerciseLibraryPage />} />
      <Route path="/active-workout" element={<ActiveWorkoutPage />} />
      <Route path="/nutrition" element={<NutritionPage />} />
      <Route path="*" element={<FrontPage />} />
    </Routes>
    </>
  );
}

export default App;
