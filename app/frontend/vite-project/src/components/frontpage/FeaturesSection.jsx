const features = [
  {
    id: 'workout',
    title: 'Workout Tracking',
    description:
      'Log your sets, reps, and weights in seconds. Our high-density interface is designed to maximize focus and minimize screen time during your session.',
    btnText: 'Log a Workout',
    btnHref: '#',
    image: 'fitness4.jpg',
    imageAlt: 'Workout Tracking',
  },
  {
    id: 'running',
    title: 'Running & GPS',
    description:
      'Track your outdoor routes and indoor treadmill sessions with deep analytics on pace, heart rate zones, and split times.',
    btnText: 'Start Running',
    btnHref: '#',
    image: 'running.jpg',
    imageAlt: 'Running Stats',
  },
  {
    id: 'nutrition',
    title: 'Calorie Dashboard',
    description:
      'Fuel your body with precision. Create custom meal plans and track your macros with our comprehensive nutritional database.',
    btnText: 'Track Nutrition',
    btnHref: '#',
    image: 'nutrition.webp',
    imageAlt: 'Nutrition Tracking',
  },
  {
    id: 'library',
    title: 'Exercise Library',
    description:
      'Master your form with our vast library of exercises. Each entry includes detailed targeting guides and muscle group breakdowns.',
    btnText: 'Browse Exercises',
    btnHref: 'exercise-library.html',
    image: 'library.jpg',
    imageAlt: 'Exercise Library',
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
        <a href={feature.btnHref} className="btn">
          {feature.btnText}
        </a>
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
