import FrontPage from './pages/FrontPage';
import WorkoutTemplatePage from './pages/WorkoutTemplatePage';

function App() {
  const path = window.location.pathname.toLowerCase();

  if (path === '/workout-template') {
    return <WorkoutTemplatePage />;
  }

  return <FrontPage />;
}

export default App;
