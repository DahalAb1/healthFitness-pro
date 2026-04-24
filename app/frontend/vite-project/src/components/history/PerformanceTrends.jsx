import TrendChartSection from '../common/TrendChartSection';
import { usePerformanceTrends } from '../../hooks/usePerformanceTrends';
import TrendsStatsBar from './TrendsStatsBar';

const FILTER_OPTIONS = [
  { key: 'day', label: '7 Days' },
  { key: 'week', label: '30 Days' },
  { key: 'month', label: 'All Time' },
];

function PerformanceTrends() {
  const {
    filter, setFilter,
    inputValue, setInputValue,
    exerciseName,
    meta, loading, error,
    filteredPoints, chartData,
    handleSearch,
  } = usePerformanceTrends();

  const emptyMessage = !exerciseName
    ? 'Enter an exercise name above to view your progress.'
    : 'No data in this time range.';

  return (
    <TrendChartSection
      title="Performance Trends"
      filterOptions={FILTER_OPTIONS}
      activeFilter={filter}
      onFilterChange={setFilter}
      loading={loading}
      error={error}
      hasData={filteredPoints.length > 0}
      chartData={chartData}
      emptyMessage={emptyMessage}
      extraControls={
        <>
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
        </>
      }
    />
  );
}

export default PerformanceTrends;
