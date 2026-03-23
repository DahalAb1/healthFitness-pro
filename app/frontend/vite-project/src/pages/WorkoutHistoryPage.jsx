import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

import WorkoutCalendar from '../components/workoutHistory/WorkoutCalendar';
import PerformanceTrends from '../components/workoutHistory/PerformanceTrends';
import WorkoutHistoryHero from '../components/workoutHistory/WorkoutHistoryHero';
import '../styles/components/workout-history/workoutHistory.css';

function WorkoutHistoryPage() {
  return (
    <>
      <Navbar />
      <section className="workout-history-main">
        <WorkoutHistoryHero />
        <WorkoutCalendar />
        <PerformanceTrends />
      </section>
      <Footer />
    </>
  );
}

export default WorkoutHistoryPage;
