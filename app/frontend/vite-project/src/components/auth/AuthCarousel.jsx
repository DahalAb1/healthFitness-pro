import { useState, useEffect } from 'react';
import img1 from '../../assets/fitness1.jpg';
import img2 from '../../assets/fitness2.webp';
import img3 from '../../assets/fitness4.jpg';
import img4 from '../../assets/fitness6.jpg';
import img5 from '../../assets/running.jpg';

const SLIDES = [
  {
    img: img1,
    tag: 'WORKOUTS',
    headline: 'Build strength with guided workout templates.',
    sub: 'Custom plans. Structured sets. Real results.',
  },
  {
    img: img2,
    tag: 'NUTRITION',
    headline: 'Track every calorie. Hit every goal.',
    sub: 'Drag-and-drop meal logging made effortless.',
  },
  {
    img: img3,
    tag: 'PROGRESS',
    headline: 'Watch yourself grow, rep by rep.',
    sub: 'Visual history of every session you complete.',
  },
  {
    img: img4,
    tag: 'LIBRARY',
    headline: 'Hundreds of exercises at your fingertips.',
    sub: 'Filter by muscle group, equipment, or difficulty.',
  },
  {
    img: img5,
    tag: 'CARDIO',
    headline: 'Go further. Run stronger. Breathe deeper.',
    sub: 'Monitor pace, distance, and endurance over time.',
  },
];

function AuthCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="auth-carousel">
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className={`auth-slide${idx === active ? ' auth-slide--active' : ''}`}
          style={{ backgroundImage: `url(${slide.img})` }}
        />
      ))}

      <div className="auth-carousel-overlay" />

      <div className="auth-carousel-content" key={active}>
        <span className="auth-slide-tag">{SLIDES[active].tag}</span>
        <h2 className="auth-slide-headline">{SLIDES[active].headline}</h2>
        <p className="auth-slide-sub">{SLIDES[active].sub}</p>

        <div className="auth-dots">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`auth-dot${idx === active ? ' auth-dot--active' : ''}`}
              onClick={() => setActive(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AuthCarousel;
