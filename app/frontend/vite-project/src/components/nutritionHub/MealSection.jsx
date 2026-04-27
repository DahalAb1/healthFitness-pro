function MealSection({
  mealType,
  items,
  onDragOver,
  onDragLeave,
  onDrop,
  onTapAdd,
  selectedFood,
  onRemove,
}) {
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
        <button
          type="button"
          className="tap-add-btn"
          disabled={!selectedFood}
          onClick={() => onTapAdd(mealType)}
        >
          Add Selected Here
        </button>
      </div>
      <div className="drop-zone">
        {items.length === 0 ? (
          <p className="drop-placeholder">Drop {mealType} here</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="logged-item" data-kcal={item.kcal}>
              <span className="logged-item-name">{item.name}</span>
              <div className="logged-item-pills">
                {item.protein_g != null && (
                  <span className="macro-pill macro-protein">
                    P {Math.round(item.protein_g)}g
                  </span>
                )}
                {item.carbs_g != null && (
                  <span className="macro-pill macro-carbs">
                    C {Math.round(item.carbs_g)}g
                  </span>
                )}
                {item.fat_g != null && (
                  <span className="macro-pill macro-fat">
                    F {Math.round(item.fat_g)}g
                  </span>
                )}
                <span className="macro-pill macro-kcal">{item.kcal} kcal</span>
                <button
                  className="remove-btn"
                  onClick={() => onRemove(mealType, idx)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MealSection;
