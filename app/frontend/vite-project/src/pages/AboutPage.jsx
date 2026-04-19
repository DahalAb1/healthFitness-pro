import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../styles/App.css';

function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="about-page">
        <section className="about-hero">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=500&fit=crop"
            alt="About Health Fitness Pro"
            className="about-hero-image"
          />
          <div className="about-hero-overlay">
            <div className="about-header">
              <p className="tagline">About Health Fitness Pro</p>
              <h1>Built For Consistency, Backed By Results</h1>
              <p>
                Health Fitness Pro gives athletes and everyday lifters a single place
                to plan workouts, track nutrition, and measure long-term progress
                without switching between multiple apps.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section about-page-section">

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
      </main>

      <Footer />
    </>
  );
}

export default AboutPage;
