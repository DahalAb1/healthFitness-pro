import FrontPage from './pages/FrontPage';
import WorkoutTemplatePage from './pages/WorkoutTemplatePage';
import WorkoutHistoryPage from './pages/WorkoutHistoryPage';

function App() {
  const path = window.location.pathname.toLowerCase();

  if (path === '/workout-template') {
    return <WorkoutTemplatePage />;
  }

  if (path === '/workout-history') {
    return <WorkoutHistoryPage />;
  }

  return <FrontPage />;
}

export default App;
