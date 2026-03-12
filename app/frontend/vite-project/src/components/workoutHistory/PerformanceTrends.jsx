import { useState } from 'react';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const CHART_DATA = {
  day: {
    labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
    data: [0, 2000, 4500, 3000, 7000, 5000],
  },
  week: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [3000, 5000, 4000, 6500, 4800, 7200, 2000],
  },
  month: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [12000, 15500, 14000, 19000],
  },
};

function PerformanceTrends() {
  const [filter, setFilter] = useState('month');

  const chartData = {
    labels: CHART_DATA[filter].labels,
    datasets: [
      {
        label: 'Volume (lbs)',
        data: CHART_DATA[filter].data,
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
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </section>
  );
}

export default PerformanceTrends;
