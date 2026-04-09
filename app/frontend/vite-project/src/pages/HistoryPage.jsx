import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

import Calendar from '../components/history/Calendar';
import PerformanceTrends from '../components/history/PerformanceTrends';
import NutritionTrends from '../components/history/NutritionTrends';
import HistoryHero from '../components/history/HistoryHero';
import '../styles/components/history/history.css';

function HistoryPage() {
  return (
    <>
      <Navbar />
      <section className="history-main">
        <HistoryHero />
        <Calendar />
        <PerformanceTrends />
        <NutritionTrends />
      </section>
      <Footer />
    </>
  );
}

export default HistoryPage;
