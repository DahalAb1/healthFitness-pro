function TrendsStatsBar({ meta }) {
  if (!meta) return null;
  return (
    <div className="trends-stats">
      <span>First: <strong>{meta.first_weight} lbs</strong></span>
      <span>Latest: <strong>{meta.last_weight} lbs</strong></span>
      <span className={meta.change >= 0 ? 'stat-up' : 'stat-down'}>
        {meta.change >= 0 ? '+' : ''}{meta.change?.toFixed(1)} lbs
        {meta.percent_change != null && ` (${meta.percent_change.toFixed(1)}%)`}
      </span>
    </div>
  );
}

export default TrendsStatsBar;
