import { Link } from 'react-router-dom';
import fitness6 from '../../assets/fitness6.jpg';
import fitness4 from '../../assets/fitness4.jpg';
import nutrition from '../../assets/nutrition.webp';
import library from '../../assets/library.jpg';

const features = [
  {
    id: 'workout-templates',
    title: 'Workout Templates',
    description:
      'Create and customize your own workout templates. Our intuitive interface allows you to quickly set up routines tailored to your fitness goals.' +
      'Or choose from our expertly crafted library of templates designed by fitness professionals.',
    btnText: 'Create a Template Or Choose from Library',
    btnHref: '/workout-template',
    image: fitness6,
    imageAlt: 'Workout Templates',
  },
  {
    id: 'workout-tracking',
    title: 'Workout Tracking',
    description:
      'Log your sets, reps, and weights in seconds. Our high-density interface is designed to maximize focus and minimize screen time during your session.',
    btnText: 'Log a Workout',
    btnHref: '/history',
    image: fitness4,
    imageAlt: 'Workout Tracking',
  },
  {
    id: 'nutrition',
    title: 'Calorie Dashboard',
    description:
      'Fuel your body with precision. Create custom meal plans and track your macros with our comprehensive nutritional database.',
    btnText: 'Track Nutrition',
    btnHref: '/nutrition',
    image: nutrition,
    imageAlt: 'Nutrition Tracking',
  },
  {
    id: 'library',
    title: 'Exercise Library',
    description:
      'Master your form with our vast library of exercises. Each entry includes detailed targeting guides and muscle group breakdowns.',
    btnText: 'Browse Exercises',
    btnHref: '/exercise-library',
    image: library,
    imageAlt: 'Exercise Library',
  },
  {
    id: 'history',
    title: 'History',
    description:
      'Review your past workouts, track your progress over time, and visualize performance trends with interactive charts.',
    btnText: 'View History',
    btnHref: '/history',
    image: fitness4,
    imageAlt: 'Workout History',
  },
];

function FeatureRow({ feature, reverse }) {
  return (
    <section
      className={`feature-row${reverse ? ' reverse' : ''}`}
      id={feature.id}
    >
      <div className="feature-content">
        <h2>{feature.title}</h2>
        <p>{feature.description}</p>
        {feature.btnHref.startsWith('/') ? (
          <Link to={feature.btnHref} className="btn">{feature.btnText}</Link>
        ) : (
          <a href={feature.btnHref} className="btn">{feature.btnText}</a>
        )}
      </div>
      <div className="feature-image-container">
        <img src={feature.image} alt={feature.imageAlt} />
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <main>
      {features.map((feature, index) => (
        <FeatureRow key={feature.id} feature={feature} reverse={index % 2 !== 0} />
      ))}
    </main>
  );
}

export default FeaturesSection;
