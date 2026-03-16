import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import WorkoutTemplateHero from '../components/workoutTemplate/WorkoutTemplateHero';
import WorkoutViewSwitcher from '../components/workoutTemplate/WorkoutViewSwitcher';
import TemplatesView from '../components/workoutTemplate/TemplatesView';
import CustomCreatorView from '../components/workoutTemplate/CustomCreatorView';
import '../styles/WorkoutTemplate.css';

function WorkoutTemplatePage() {
  const [activeView, setActiveView] = useState('templates');

  return (
    <>
      <Navbar />
      <WorkoutTemplateHero />

      <div className="wt-hub-controls">
        <WorkoutViewSwitcher activeView={activeView} setActiveView={setActiveView} />
      </div>

      <main className="wt-hub-container">
        {activeView === 'templates' ? <TemplatesView /> : <CustomCreatorView />}
      </main>

      <Footer />
    </>
  );
}

export default WorkoutTemplatePage;
