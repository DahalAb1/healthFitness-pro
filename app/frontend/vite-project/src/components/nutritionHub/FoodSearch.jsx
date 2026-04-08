/**
 * SRP: responsible only for the custom food entry form.
 */
function CustomFoodForm({ customName, customKcal, onCustomNameChange, onCustomKcalChange, onAddCustom }) {
  return (
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
  );
}

/**
 * SRP: responsible for displaying the food search input and live results list.
 * Delegates the custom-entry form to CustomFoodForm.
 */
function FoodSearch({
  searchQuery, onSearchChange,
  searchResults, isSearching, onDragStart,
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
        {isSearching && (
          <p className="drop-placeholder">Searching...</p>
        )}
        {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
          <p className="drop-placeholder">No results found.</p>
        )}
        {!isSearching && searchResults.map((food, idx) => {
          const label = food.name;
          const portion = food.serving_description || (() => {
            const match = food.name.match(/\(([^)]+)\)$/);
            return match?.[1] ?? null;
          })();
          return (
            <div
              key={idx}
              className="draggable-food"
              draggable
              onDragStart={(e) => onDragStart(e, food)}
            >
              <span className="food-name">{label}</span>
              <div className="food-macros">
                {portion && <span className="food-portion">{portion}</span>}
                {food.protein_g != null && <span className="macro-pill macro-protein">P {Math.round(food.protein_g)}g</span>}
                {food.carbs_g != null && <span className="macro-pill macro-carbs">C {Math.round(food.carbs_g)}g</span>}
                {food.fat_g != null && <span className="macro-pill macro-fat">F {Math.round(food.fat_g)}g</span>}
                <span className="macro-pill macro-kcal">{food.kcal} kcal</span>
              </div>
            </div>
          );
        })}
      </div>

      <CustomFoodForm
        customName={customName}
        customKcal={customKcal}
        onCustomNameChange={onCustomNameChange}
        onCustomKcalChange={onCustomKcalChange}
        onAddCustom={onAddCustom}
      />
    </div>
  );
}

export default FoodSearch;
