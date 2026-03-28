function MealSection({ mealType, items, onDragOver, onDragLeave, onDrop, onRemove }) {
  const total = items.reduce((sum, item) => sum + item.kcal, 0);
  const label = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  return (
    <div
      className="meal-section"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, mealType)}
    >
      <div className="meal-header">
        <h4>{label}</h4>
        <span style={{ fontSize: '12px', fontWeight: '700' }}>{total} kcal</span>
      </div>
      <div className="drop-zone">
        {items.length === 0 ? (
          <p className="drop-placeholder">Drop {mealType} here</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="logged-item" data-kcal={item.kcal}>
              <span>
                {item.name}
                <b style={{ color: 'var(--accent)', marginLeft: '8px' }}>{item.kcal}</b>
              </span>
              <button className="remove-btn" onClick={() => onRemove(mealType, idx)}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MealSection;
