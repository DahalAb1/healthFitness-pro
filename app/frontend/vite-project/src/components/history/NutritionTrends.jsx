import TrendChartSection from '../common/TrendChartSection';
import { useNutritionTrends, MACRO_KEYS } from '../../hooks/useNutritionTrends';

const FILTER_OPTIONS = [
  { key: 'week', label: '7 Days' },
  { key: 'month', label: '30 Days' },
  { key: 'all', label: 'All Time' },
];

const MACRO_META = {
  kcal:    { label: 'Calories', color: '#4A90FF' },
  protein: { label: 'Protein',  color: '#4AFF8C' },
  carbs:   { label: 'Carbs',    color: '#FFC94A' },
  fat:     { label: 'Fat',      color: '#FF8C4A' },
};

const NUTRITION_CHART_OPTIONS = {
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
    <TrendChartSection
      title="Nutrition Trends"
      filterOptions={FILTER_OPTIONS}
      activeFilter={filter}
      onFilterChange={setFilter}
      loading={loading}
      error={error}
      hasData={filteredPoints.length > 0}
      chartData={chartData}
      emptyMessage="No nutrition data logged in this time range."
      chartOptions={NUTRITION_CHART_OPTIONS}
      extraControls={
        <>
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
        </>
      }
    />
  );
}

export default NutritionTrends;
