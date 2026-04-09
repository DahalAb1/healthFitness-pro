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
import { useNutritionTrends, MACRO_KEYS } from '../../hooks/useNutritionTrends';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const FILTER_LABELS = { week: '7 Days', month: '30 Days', all: 'All Time' };

const MACRO_META = {
  kcal:    { label: 'Calories', color: '#4A90FF' },
  protein: { label: 'Protein',  color: '#4AFF8C' },
  carbs:   { label: 'Carbs',    color: '#FFC94A' },
  fat:     { label: 'Fat',      color: '#FF8C4A' },
};

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: { legend: { display: false } },
  scales: {
    y: { grid: { color: '#222' }, ticks: { color: '#888' } },
    x: { grid: { display: false }, ticks: { color: '#888', maxTicksLimit: 10 } },
  },
};

function NutritionTrends() {
  const {
    filter, setFilter,
    activeMacro, setActiveMacro,
    filteredPoints,
    chartData,
    summaryStats,
    loading,
    error,
  } = useNutritionTrends();

  return (
    <section className="progress-tracker">
      <div className="progress-header">
        <h2>Nutrition Trends</h2>
        <div className="time-filters">
          {['week', 'month', 'all'].map((f) => (
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

      <div className="nutrition-macro-toggles">
        {MACRO_KEYS.map((key) => {
          const { label, color } = MACRO_META[key];
          const active = activeMacro === key;
          return (
            <button
              key={key}
              className={`macro-toggle-btn${active ? ' active' : ''}`}
              style={active ? { borderColor: color, color, backgroundColor: `${color}18` } : {}}
              onClick={() => setActiveMacro(key)}
            >
              <span className="macro-toggle-dot" style={{ background: active ? color : '#444' }} />
              {label}
            </button>
          );
        })}
      </div>

      {summaryStats && (
        <div className="trends-stats">
          <span>Days logged: <strong>{summaryStats.days}</strong></span>
          {activeMacro === 'kcal'    && <span>Avg kcal: <strong style={{ color: '#4A90FF' }}>{summaryStats.avgKcal}</strong></span>}
          {activeMacro === 'protein' && <span>Avg protein: <strong style={{ color: '#4AFF8C' }}>{summaryStats.avgProtein}g</strong></span>}
          {activeMacro === 'carbs'   && <span>Avg carbs: <strong style={{ color: '#FFC94A' }}>{summaryStats.avgCarbs}g</strong></span>}
          {activeMacro === 'fat'     && <span>Avg fat: <strong style={{ color: '#FF8C4A' }}>{summaryStats.avgFat}g</strong></span>}
        </div>
      )}

      <div className="chart-container">
        {loading && <div className="trends-empty">Loading…</div>}
        {!loading && error && <div className="trends-empty trends-error">{error}</div>}
        {!loading && !error && filteredPoints.length === 0 && (
          <div className="trends-empty">No nutrition data logged in this time range.</div>
        )}
        {!loading && !error && filteredPoints.length > 0 && (
          <Line data={chartData} options={CHART_OPTIONS} />
        )}
      </div>
    </section>
  );
}

export default NutritionTrends;
