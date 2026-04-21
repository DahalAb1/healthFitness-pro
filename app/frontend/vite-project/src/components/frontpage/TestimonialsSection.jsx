import { useState, useEffect, useRef } from 'react';

const testimonials = [
  {
    quote:
      '"The cleanest interface I\'ve ever used. I can log my heavy sets in seconds without losing my pump."',
    name: '— Alex Rivera',
    title: 'Competitive Powerlifter',
  },
  {
    quote:
      '"Creating custom workouts is so intuitive. I build my entire program in minutes."',
    name: '— Jordan Smith',
    title: 'Personal Trainer',
  },
  {
    quote:
      '"I love the calorie dashboard. It makes hitting my macros so much easier during prep."',
    name: '— Sarah Chen',
    title: 'Bikini Athlete',
  },
  {
    quote:
      '"Simple, effective, and stays out of the way. Exactly what I needed for my home workouts."',
    name: '— Mike Ross',
    title: 'Fitness Enthusiast',
  },
];

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (maxScroll <= 0) {
        setActiveIndex(0);
        return;
      }

      const progress = container.scrollLeft / maxScroll;
      const index = Math.round(progress * (testimonials.length - 1));
      setActiveIndex(Math.min(Math.max(index, 0), testimonials.length - 1));
    };

    // Sync active dot on mount and resize, not just while scrolling.
    handleScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToCard = (index) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[index];
    if (!card) return;
    container.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  };

  return (
    <section className="mission-intro alt-bg">
      <div className="mission-container">
        <p className="tagline mission-tagline">Success Stories</p>
        <h2 style={{ marginBottom: '40px' }}>Trusted by Athletes</h2>

        <div ref={scrollRef} className="testimonials-scroll" tabIndex={0} aria-label="Testimonials carousel" role="region">
          {testimonials.map((t) => (
            <div key={t.name} className="testimonial-card" tabIndex={0} style={{ scrollSnapAlign: 'center' }}>
              <p>{t.quote}</p>
              <h4>{t.name}</h4>
              <span>{t.title}</span>
            </div>
          ))}
        </div>

        <div className="testimonials-dots">
          {testimonials.map((_, i) => (
            <div
              key={i}
              className={`dot ${i === activeIndex ? 'active' : 'inactive'}`}
              onClick={() => scrollToCard(i)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
