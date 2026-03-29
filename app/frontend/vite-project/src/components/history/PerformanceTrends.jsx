import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { usePerformanceTrends } from '../../hooks/usePerformanceTrends';
import TrendsStatsBar from './TrendsStatsBar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const FILTER_LABELS = { day: '7 Days', week: '30 Days', month: 'All Time' };

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { grid: { color: '#222' }, ticks: { color: '#888' } },
    x: { grid: { display: false }, ticks: { color: '#888' } },
  },
};

function PerformanceTrends() {
  const {
    filter, setFilter,
    inputValue, setInputValue,
    exerciseName,
    meta, loading, error,
    filteredPoints, chartData,
    handleSearch,
  } = usePerformanceTrends();

  return (
    <section className="progress-tracker">
      <div className="progress-header">
        <h2>Performance Trends</h2>
        <div className="time-filters">
          {['day', 'week', 'month'].map((f) => (
            <button
              key={f}
              className={`filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <form className="trends-search" onSubmit={handleSearch}>
        <input
          type="text"
          className="trends-input"
          placeholder="Exercise name (e.g. Bench Press)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="trends-search-btn">Load</button>
      </form>

      <TrendsStatsBar meta={!error ? meta : null} />

      <div className="chart-container">
        {!exerciseName && !loading && (
          <div className="trends-empty">Enter an exercise name above to view your progress.</div>
        )}
        {loading && <div className="trends-empty">Loading…</div>}
        {!loading && error && <div className="trends-empty trends-error">{error}</div>}
        {!loading && !error && exerciseName && filteredPoints.length === 0 && (
          <div className="trends-empty">No data in this time range.</div>
        )}
        {!loading && !error && filteredPoints.length > 0 && (
          <Line data={chartData} options={CHART_OPTIONS} />
        )}
      </div>
    </section>
  );
}

export default PerformanceTrends;
