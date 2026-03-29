import ExerciseCard from './ExerciseCard';

function ExerciseCarousel({ exercises, currentIndex, setLogs, onSetUpdate }) {
  return (
    <section className="aw-carousel">
      <div className="aw-carousel-track">
        <ExerciseCard exercise={exercises[currentIndex - 1]} variant="past" />
        <ExerciseCard
          exercise={exercises[currentIndex]}
          variant="current"
          setLogs={setLogs[currentIndex]}
          onSetUpdate={(setIdx, field, value) => onSetUpdate(currentIndex, setIdx, field, value)}
        />
        <ExerciseCard exercise={exercises[currentIndex + 1]} variant="future" />
      </div>
    </section>
  );
}

export default ExerciseCarousel;
