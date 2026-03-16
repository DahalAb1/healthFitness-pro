import './App.css';
import Navbar from './components/Navbar';
import HeroSlideshow from './components/HeroSlideshow';
import MissionSection from './components/MissionSection';
import TestimonialsSection from './components/TestimonialsSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <HeroSlideshow />
      <MissionSection />
      <TestimonialsSection />
      <FeaturesSection />
      <Footer />
    </>
  );
}

export default App;
