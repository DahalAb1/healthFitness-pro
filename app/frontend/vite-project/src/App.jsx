import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import FrontPage from './pages/FrontPage';
import WorkoutTemplatePage from './pages/WorkoutTemplatePage';
import WorkoutHistoryPage from './pages/WorkoutHistoryPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import ActiveWorkoutPage from './pages/ActiveWorkoutPage';
import NutritionPage from './pages/NutritionPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AccountPage from './pages/AccountPage';

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
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="*" element={<FrontPage />} />
    </Routes>
    </>
  );
}

export default App;
