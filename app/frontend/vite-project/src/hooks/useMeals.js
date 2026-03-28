import { useState } from 'react';

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'misc'];

const emptyMeals = () => Object.fromEntries(MEAL_TYPES.map(t => [t, []]));

/**
 * Encapsulates all meal log concerns:
 *  - meal state keyed by meal type
 *  - adding a food item to a meal
 *  - removing a food item from a meal
 *
 * SRP: this hook is the single source of truth for the daily meal log.
 */
export function useMeals() {
  const [meals, setMeals] = useState(emptyMeals);

  const addToMeal = (mealType, food) => {
    setMeals(prev => ({ ...prev, [mealType]: [...prev[mealType], food] }));
  };

  const removeFromMeal = (mealType, index) => {
    setMeals(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index),
    }));
  };

  const totalCalories = Object.values(meals).flat().reduce((sum, item) => sum + item.kcal, 0);

  return { meals, addToMeal, removeFromMeal, totalCalories };
}
