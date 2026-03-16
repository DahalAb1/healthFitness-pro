import './App.css';
import Navbar from './components/Navbar';
import HeroSlideshow from './components/HeroSlideshow';
import MissionSection from './components/MissionSection';
import TestimonialsSection from './components/TestimonialsSection';
import FeaturesSection from './components/FeaturesSection';

function App() {
  return (
    <>
      <Navbar />
      <HeroSlideshow />
      <MissionSection />
      <TestimonialsSection />
      <FeaturesSection />
    </>
  );
}

export default App;
