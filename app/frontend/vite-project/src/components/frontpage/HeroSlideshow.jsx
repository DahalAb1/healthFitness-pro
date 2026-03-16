import { useState, useEffect } from 'react';

const slides = [
  { src: 'fitness1.jpg', alt: 'Hero 1' },
  { src: 'fitness2.webp', alt: 'Hero 2' },
  { src: 'fitness 3.jpg', alt: 'Hero 3' },
];

function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="hero-slideshow">
      <div className="slideshow-container">
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img src={slide.src} alt={slide.alt} />
          </div>
        ))}
      </div>

      <div className="hero-overlay">
        <p className="tagline">Your fitness journey starts here!</p>
        <h1>Health Fitness Pro</h1>
        <p className="hero-subtitle">
          The most intuitive workout tracking experience for serious athletes.
          Precision data, zero distractions.
        </p>
        <a href="#mission" className="btn">Get Started Today</a>
      </div>
    </header>
  );
}

export default HeroSlideshow;
