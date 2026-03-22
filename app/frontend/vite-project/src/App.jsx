import FrontPage from './pages/FrontPage';
import WorkoutTemplatePage from './pages/WorkoutTemplatePage';
import WorkoutHistoryPage from './pages/WorkoutHistoryPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';

function App() {
  const path = window.location.pathname.toLowerCase();

  if (path === '/workout-template') {
    return <WorkoutTemplatePage />;
  }

  if (path === '/workout-history') {
    return <WorkoutHistoryPage />;
  }

  if (path === '/exercise-library') {
    return <ExerciseLibraryPage />;
  }

  return <FrontPage />;
}

export default App;
