import React, { useState } from 'react';
import NutritionHero from './NutritionHero';
import CalorieGauge from './CalorieGauge';
import FoodSearch from './FoodSearch';
import MealSection from './MealSection';
import { useFoodSearch } from '../../hooks/useFoodSearch';
import { useMeals, MEAL_TYPES } from '../../hooks/useMeals';

/**
 * SRP: responsible only for layout and wiring together child components.
 * DIP: depends on useFoodSearch and useMeals abstractions, not on API or state directly.
 */
function NutritionPage() {
  const [goal, setGoal] = useState(2500);

  const {
    searchQuery, setSearchQuery,
    searchResults, isSearching,
    customName, setCustomName,
    customKcal, setCustomKcal,
    handleAddCustom,
  } = useFoodSearch();

  const { meals, addToMeal, removeFromMeal, totalCalories } = useMeals();

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
    addToMeal(mealType, food);
  };

  return (
    <div className="container nutrition-hub-container">
      <NutritionHero total={totalCalories} goal={goal} />

      <div className="log-grid">
        <div className="log-sidebar">
          <CalorieGauge
            total={totalCalories}
            goal={goal}
            onGoalChange={setGoal}
          />
          <FoodSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
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
              onRemove={removeFromMeal}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default NutritionPage;
