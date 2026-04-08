import React, { useState } from 'react';
import NutritionHero from './NutritionHero';
import MacroGauge from './MacroGauge';
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
  const [proteinGoal, setProteinGoal] = useState(150);
  const [carbsGoal, setCarbsGoal] = useState(200);
  const [fatGoal, setFatGoal] = useState(65);

  const {
    searchQuery, setSearchQuery,
    searchResults, isSearching,
    customName, setCustomName,
    customKcal, setCustomKcal,
    customProtein, setCustomProtein,
    customCarbs, setCustomCarbs,
    customFat, setCustomFat,
    handleAddCustom,
  } = useFoodSearch();

  const { meals, addToMeal, removeFromMeal, totalCalories, totalMacros } = useMeals();

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
      <NutritionHero total={totalCalories} goal={goal} totalMacros={totalMacros} />

      <div className="log-grid">
        <div className="log-sidebar">
          <FoodSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            onDragStart={handleDragStart}
            customName={customName}
            customKcal={customKcal}
            customProtein={customProtein}
            customCarbs={customCarbs}
            customFat={customFat}
            onCustomNameChange={setCustomName}
            onCustomKcalChange={setCustomKcal}
            onCustomProteinChange={setCustomProtein}
            onCustomCarbsChange={setCustomCarbs}
            onCustomFatChange={setCustomFat}
            onAddCustom={handleAddCustom}
          />
          <div className="macro-gauges-row">
            <MacroGauge
              label="Calories"
              unit="kcal"
              total={totalCalories}
              goal={goal}
              onGoalChange={setGoal}
              accentColor="var(--accent)"
            />
            <MacroGauge
              label="Protein"
              total={totalMacros.protein_g}
              goal={proteinGoal}
              onGoalChange={setProteinGoal}
              accentColor="#4aff8c"
            />
            <MacroGauge
              label="Carbs"
              total={totalMacros.carbs_g}
              goal={carbsGoal}
              onGoalChange={setCarbsGoal}
              accentColor="#ffc94a"
            />
            <MacroGauge
              label="Fat"
              total={totalMacros.fat_g}
              goal={fatGoal}
              onGoalChange={setFatGoal}
              accentColor="#ff8c4a"
            />
          </div>
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
