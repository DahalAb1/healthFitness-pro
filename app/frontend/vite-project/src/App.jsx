import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import FrontPage from './pages/FrontPage';
import WorkoutTemplatePage from './pages/WorkoutTemplatePage';
import HistoryPage from './pages/HistoryPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import ActiveWorkoutPage from './pages/ActiveWorkoutPage';
import NutritionPage from './pages/NutritionPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AccountPage from './pages/AccountPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/workout-template" element={<WorkoutTemplatePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/exercise-library" element={<ExerciseLibraryPage />} />
          <Route path="/active-workout" element={<ActiveWorkoutPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<FrontPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
