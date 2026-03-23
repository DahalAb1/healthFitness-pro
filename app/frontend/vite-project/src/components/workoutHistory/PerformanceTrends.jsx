import { useState, useEffect, useMemo } from 'react';
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
import { getProgressWeights } from '../../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const FILTER_DAYS = { day: 7, week: 30, month: Infinity };
const FILTER_LABELS = { day: '7 Days', week: '30 Days', month: 'All Time' };

function PerformanceTrends() {
  const [filter, setFilter] = useState('month');
  const [inputValue, setInputValue] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [allPoints, setAllPoints] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!exerciseName) return;
    setLoading(true);
    setError(null);
    getProgressWeights(1, exerciseName)
      .then((data) => {
        setAllPoints(data.points || []);
        setMeta(data);
      })
      .catch(() => {
        setError('No progress data found for this exercise.');
        setAllPoints([]);
        setMeta(null);
      })
      .finally(() => setLoading(false));
  }, [exerciseName]);

  const filteredPoints = useMemo(() => {
    const maxDays = FILTER_DAYS[filter];
    if (maxDays === Infinity) return allPoints;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxDays);
    return allPoints.filter((p) => new Date(p.date + 'T00:00:00') >= cutoff);
  }, [allPoints, filter]);

  const chartData = {
    labels: filteredPoints.map((p) => p.date),
    datasets: [
      {
        label: 'Max Weight (lbs)',
        data: filteredPoints.map((p) => p.weight),
        borderColor: '#4A90FF',
        backgroundColor: 'rgba(74, 144, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#222' }, ticks: { color: '#888' } },
      x: { grid: { display: false }, ticks: { color: '#888' } },
    },
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const name = inputValue.trim();
    if (name) setExerciseName(name);
  };

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

      {meta && !error && (
        <div className="trends-stats">
          <span>First: <strong>{meta.first_weight} lbs</strong></span>
          <span>Latest: <strong>{meta.last_weight} lbs</strong></span>
          <span className={meta.change >= 0 ? 'stat-up' : 'stat-down'}>
            {meta.change >= 0 ? '+' : ''}{meta.change?.toFixed(1)} lbs
            {meta.percent_change != null && ` (${meta.percent_change.toFixed(1)}%)`}
          </span>
        </div>
      )}

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
          <Line data={chartData} options={options} />
        )}
      </div>
    </section>
  );
}

export default PerformanceTrends;
