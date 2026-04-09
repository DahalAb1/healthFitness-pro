import nutritionImg from '../../assets/food_pyramid.jpg';

function NutritionHero({ total, goal, totalMacros }) {
  const isOver = total > goal;
  return (
    <div className="nutrition-hero">
      <div className="nutrition-hero-text">
        <h1>Nutrition</h1>
        <p className="nutrition-hero-description">
          Track your daily macronutrients, log meals by dragging foods into each section,
          and set a personal macronutrient goal to stay on target.
        </p>
        <div className="stat-strip">
          <div className={`stat-pill${isOver ? ' over' : ''}`}>
            CALORIES: <span style={{ marginLeft: '5px' }}>{total}</span> KCAL
          </div>
          {totalMacros && (
            <>
              <div className="stat-pill macro-stat-protein">
                PROTEIN: <span style={{ marginLeft: '5px' }}>{Math.round(totalMacros.protein_g)}g</span>
              </div>
              <div className="stat-pill macro-stat-carbs">
                CARBS: <span style={{ marginLeft: '5px' }}>{Math.round(totalMacros.carbs_g)}g</span>
              </div>
              <div className="stat-pill macro-stat-fat">
                FAT: <span style={{ marginLeft: '5px' }}>{Math.round(totalMacros.fat_g)}g</span>
              </div>
            </>
          )}
        </div>
      </div>
      <img src={nutritionImg} alt="Nutrition" className="nutrition-hero-img" />
    </div>
  );
}

export default NutritionHero;
