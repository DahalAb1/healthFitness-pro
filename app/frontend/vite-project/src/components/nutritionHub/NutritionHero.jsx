import nutritionImg from '../../assets/food_pyramid.jpg';

function NutritionHero({ total, goal }) {
  const isOver = total > goal;
  return (
    <div className="nutrition-hero">
      <div className="nutrition-hero-text">
        <h1>Nutrition</h1>
        <p className="nutrition-hero-description">
          Track your daily calories, log meals by dragging foods into each section,
          and set a personal calorie goal to stay on target.
        </p>
        <div className="stat-strip">
          <div className={`stat-pill${isOver ? ' over' : ''}`}>
            TODAY: <span style={{ marginLeft: '5px' }}>{total}</span> KCAL
          </div>
        </div>
      </div>
      <img src={nutritionImg} alt="Nutrition" className="nutrition-hero-img" />
    </div>
  );
}

export default NutritionHero;
