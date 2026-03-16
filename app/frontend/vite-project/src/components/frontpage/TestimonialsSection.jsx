const testimonials = [
  {
    quote:
      '"The cleanest interface I\'ve ever used. I can log my heavy sets in seconds without losing my pump."',
    name: '— Alex Rivera',
    title: 'Competitive Powerlifter',
  },
  {
    quote:
      '"The GPS tracking for my morning runs is pinpoint accurate. Finally, an app that doesn\'t feel cluttered."',
    name: '— Jordan Smith',
    title: 'Marathon Runner',
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
  return (
    <section className="mission-intro alt-bg">
      <div className="mission-container">
        <p className="tagline mission-tagline">Success Stories</p>
        <h2 style={{ marginBottom: '40px' }}>Trusted by Athletes</h2>

        <div className="testimonials-scroll" tabIndex={0} aria-label="Testimonials carousel" role="region">
          {testimonials.map((t) => (
            <div key={t.name} className="testimonial-card" tabIndex={0} style={{scrollSnapAlign: 'center'}}>
              <p>{t.quote}</p>
              <h4>{t.name}</h4>
              <span>{t.title}</span>
            </div>
          ))}
        </div>

        <div className="testimonials-dots">
          <div className="dot active" />
          <div className="dot inactive" />
          <div className="dot inactive" />
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
