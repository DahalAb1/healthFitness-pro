function AboutSection() {
  return (
    <section className="about-section" id="about-us">
      <div className="about-header">
        <p className="tagline">About Health Fitness Pro</p>
        <h2>Built For Consistency, Backed By Results</h2>
        <p>
          Health Fitness Pro gives athletes and everyday lifters a single place
          to plan workouts, track nutrition, and measure long-term progress
          without switching between multiple apps.
        </p>
      </div>

      <div className="about-grid">
        <article className="about-card">
          <h3>Our Achievements</h3>
          <p>
            We have helped users build healthier routines by combining workout
            planning, performance tracking, and nutrition logging into one clear
            system.
          </p>
        </article>

        <article className="about-card">
          <h3>What We Offer</h3>
          <p>
            Personalized workout templates, an exercise library, active workout
            tracking, and nutrition tools designed to support every stage of
            your fitness journey.
          </p>
        </article>

        <article className="about-card">
          <h3>Why It Works</h3>
          <p>
            We focus on simple daily actions and clear progress insights so you
            can stay motivated, improve performance, and keep momentum week
            after week.
          </p>
        </article>
      </div>
    </section>
  );
}

export default AboutSection;