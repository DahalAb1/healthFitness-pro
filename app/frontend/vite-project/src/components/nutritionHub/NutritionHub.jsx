import React, { useState } from 'react';
import NutritionHero from './NutritionHero';
import CalorieGauge from './CalorieGauge';
import FoodSearch from './FoodSearch';
import MealSection from './MealSection';

const CIRCUMFERENCE = 2 * Math.PI * 62;
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'misc'];

const FOOD_DB = [
  { name: 'Chicken Breast (100g)', kcal: 165 },
  { name: 'Brown Rice (1 cup)', kcal: 216 },
  { name: 'Egg (large)', kcal: 78 },
  { name: 'Banana', kcal: 89 },
  { name: 'Apple', kcal: 95 },
  { name: 'Oatmeal (1 cup cooked)', kcal: 154 },
  { name: 'Greek Yogurt (6oz)', kcal: 100 },
  { name: 'Almonds (1oz)', kcal: 164 },
  { name: 'Salmon (100g)', kcal: 208 },
  { name: 'Broccoli (1 cup)', kcal: 55 },
  { name: 'Sweet Potato (medium)', kcal: 103 },
  { name: 'Whole Milk (1 cup)', kcal: 149 },
  { name: 'Cheddar Cheese (1oz)', kcal: 113 },
  { name: 'Pasta (1 cup cooked)', kcal: 220 },
  { name: 'Bread (1 slice)', kcal: 79 },
  { name: 'Peanut Butter (2 tbsp)', kcal: 188 },
  { name: 'Orange', kcal: 62 },
  { name: 'Steak (100g)', kcal: 271 },
  { name: 'Tuna (100g)', kcal: 116 },
  { name: 'Cottage Cheese (1 cup)', kcal: 206 },
  { name: 'Avocado (half)', kcal: 120 },
  { name: 'Blueberries (1 cup)', kcal: 84 },
  { name: 'Protein Shake (scoop)', kcal: 120 },
  { name: 'Orange Juice (8oz)', kcal: 112 },
  { name: 'Black Beans (1 cup)', kcal: 227 },
  { name: 'Spinach (1 cup raw)', kcal: 7 },
  { name: 'Carrot (medium)', kcal: 25 },
  { name: 'Shrimp (100g)', kcal: 99 },
  { name: 'Quinoa (1 cup cooked)', kcal: 222 },
  { name: 'Bagel (plain)', kcal: 270 },
];

function NutritionPage() {
  const [goal, setGoal] = useState(2500);
  const [meals, setMeals] = useState({ breakfast: [], lunch: [], dinner: [], misc: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [customFoods, setCustomFoods] = useState([]);
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');

  const allFoods = [...customFoods, ...FOOD_DB];
  const searchResults = searchQuery.trim()
    ? allFoods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allFoods;

  const getTotalDaily = () => Object.values(meals).flat().reduce((sum, item) => sum + item.kcal, 0);

  const total = getTotalDaily();
  const remaining = goal - total;
  const pct = Math.min((total / goal) * 100, 100);
  const strokeDashOffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
  const circleStroke = total > goal ? 'var(--danger)' : total === goal ? 'var(--success)' : 'var(--accent)';

  const handleAddCustom = () => {
    if (customName && customKcal) {
      setCustomFoods(prev => [{ name: customName, kcal: parseInt(customKcal) }, ...prev]);
      setSearchQuery(customName);
      setCustomName('');
      setCustomKcal('');
    }
  };

  const handleDragStart = (e, food) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(food));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, mealType) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const food = JSON.parse(e.dataTransfer.getData('application/json'));
    setMeals(prev => ({ ...prev, [mealType]: [...prev[mealType], food] }));
  };

  const handleRemove = (mealType, index) => {
    setMeals(prev => ({ ...prev, [mealType]: prev[mealType].filter((_, i) => i !== index) }));
  };

  return (
    <div className="container nutrition-hub-container">
      <NutritionHero total={total} goal={goal} />

      <div className="log-grid">
        <div className="log-sidebar">
          <CalorieGauge
            goal={goal}
            onGoalChange={setGoal}
            strokeDashOffset={strokeDashOffset}
            circleStroke={circleStroke}
            remaining={remaining}
          />
          <FoodSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            onDragStart={handleDragStart}
            customName={customName}
            customKcal={customKcal}
            onCustomNameChange={setCustomName}
            onCustomKcalChange={setCustomKcal}
            onAddCustom={handleAddCustom}
          />
        </div>

        <div className="log-main">
          {MEAL_TYPES.map(mealType => (
            <MealSection
              key={mealType}
              mealType={mealType}
              items={meals[mealType]}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default NutritionPage;
