function AsyncState({
  loading,
  error,
  empty,
  loadingText = 'Loading…',
  errorText,
  emptyText,
  className = '',
  children,
}) {
  if (loading) return <div className={`async-state ${className}`.trim()}>{loadingText}</div>;
  if (error)   return <div className={`async-state async-state--error ${className}`.trim()}>{errorText || error}</div>;
  if (empty)   return <div className={`async-state ${className}`.trim()}>{emptyText}</div>;
  return children;
}

export default AsyncState;
