import { Line } from 'react-chartjs-2';
import AsyncState from './AsyncState';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const SHARED_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { grid: { color: '#222' }, ticks: { color: '#888' } },
    x: { grid: { display: false }, ticks: { color: '#888' } },
  },
};

function TrendChartSection({
  title,
  filterOptions,
  activeFilter,
  onFilterChange,
  loading,
  error,
  hasData,
  chartData,
  emptyMessage,
  chartOptions,
  extraControls,
}) {
  return (
    <section className="progress-tracker">
      <div className="progress-header">
        <h2>{title}</h2>
        <div className="time-filters">
          {filterOptions.map(({ key, label }) => (
            <button
              key={key}
              className={`filter-btn${activeFilter === key ? ' active' : ''}`}
              onClick={() => onFilterChange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {extraControls}

      <div className="chart-container">
        <AsyncState
          loading={loading}
          error={error}
          empty={!hasData}
          emptyText={emptyMessage}
          className="trends-empty"
        >
          <Line data={chartData} options={chartOptions ?? SHARED_CHART_OPTIONS} />
        </AsyncState>
      </div>
    </section>
  );
}

export default TrendChartSection;
