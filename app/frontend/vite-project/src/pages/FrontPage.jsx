import Navbar from '../components/common/Navbar';
import HeroSlideshow from '../components/frontpage/HeroSlideshow';
import MissionSection from '../components/frontpage/MissionSection';
import TestimonialsSection from '../components/frontpage/TestimonialsSection';
import FeaturesSection from '../components/frontpage/FeaturesSection';
import AboutSection from '../components/frontpage/AboutSection';
import Footer from '../components/common/Footer';
import '../styles/App.css';

function FrontPage() {
  return (
    <>
      <Navbar />
      <HeroSlideshow />
      <MissionSection />
      <TestimonialsSection />
      <FeaturesSection />
      <AboutSection />
      <Footer />
    </>
  );
}

export default FrontPage;
