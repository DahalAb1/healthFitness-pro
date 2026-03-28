function FoodSearch({
  searchQuery, onSearchChange,
  searchResults, onDragStart,
  customName, customKcal,
  onCustomNameChange, onCustomKcalChange,
  onAddCustom,
}) {
  return (
    <div className="sidebar-card">
      <div className="input-group">
        <label>Find Food</label>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div className="results-area">
        {searchResults.map((food, idx) => {
          // Split "Chicken Breast (100g)" into label "Chicken Breast" and portion "100g"
          const match = food.name.match(/^(.+?)(?:\s*\(([^)]+)\))?$/);
          const label = match?.[1] ?? food.name;
          const portion = match?.[2] ?? null;
          return (
            <div
              key={idx}
              className="draggable-food"
              draggable
              onDragStart={(e) => onDragStart(e, food)}
            >
              <span className="food-name">{label}</span>
              <div className="food-meta">
                {portion && <span className="food-portion">{portion}</span>}
                <span className="food-kcal">{food.kcal} kcal</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
        <label>Quick Custom Log</label>
        <input
          type="text"
          placeholder="Food Name"
          value={customName}
          onChange={(e) => onCustomNameChange(e.target.value)}
          style={{ marginBottom: '8px', width: '100%' }}
        />
        <input
          type="number"
          placeholder="Calories"
          value={customKcal}
          onChange={(e) => onCustomKcalChange(e.target.value)}
          style={{ width: '100%' }}
        />
        <button className="btn btn-add" onClick={onAddCustom}>
          Add to Results
        </button>
      </div>
    </div>
  );
}

export default FoodSearch;
