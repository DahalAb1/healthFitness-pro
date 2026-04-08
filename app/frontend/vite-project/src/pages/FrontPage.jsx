import Navbar from '../components/common/Navbar';
import HeroSlideshow from '../components/frontpage/HeroSlideshow';
import MissionSection from '../components/frontpage/MissionSection';
import AboutSection from '../components/frontpage/AboutSection';
import TestimonialsSection from '../components/frontpage/TestimonialsSection';
import FeaturesSection from '../components/frontpage/FeaturesSection';
import Footer from '../components/common/Footer';
import '../styles/App.css';

function FrontPage() {
  return (
    <>
      <Navbar />
      <HeroSlideshow />
      <AboutSection />
      <MissionSection />
      <TestimonialsSection />
      <FeaturesSection />
      <Footer />
    </>
  );
}

export default FrontPage;
