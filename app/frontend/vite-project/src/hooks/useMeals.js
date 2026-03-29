import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { getMealLogs, addMealLog, deleteMealLog } from '../utils/api';

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'misc'];

const emptyMeals = () => Object.fromEntries(MEAL_TYPES.map(t => [t, []]));

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Maps a flat array of MealLogRead objects to { breakfast: [...], lunch: [...], ... } */
const groupByMealType = (logs) => {
  const grouped = emptyMeals();
  for (const log of logs) {
    if (grouped[log.meal_type] !== undefined) {
      grouped[log.meal_type].push({ id: log.id, name: log.food_name, kcal: log.kcal });
    }
  }
  return grouped;
};

/**
 * Encapsulates all meal log concerns:
 *  - meal state keyed by meal type
 *  - adding a food item to a meal (persisted to the database)
 *  - removing a food item from a meal (deleted from the database)
 *
 * SRP: this hook is the single source of truth for the daily meal log.
 */
export function useMeals() {
  const { token } = useAuth();
  const [meals, setMeals] = useState(emptyMeals);

  // Load today's meals from the backend whenever the auth token changes.
  useEffect(() => {
    if (!token) {
      setMeals(emptyMeals());
      return;
    }
    getMealLogs(token, getTodayString())
      .then(logs => setMeals(groupByMealType(logs)))
      .catch(() => setMeals(emptyMeals()));
  }, [token]);

  const addToMeal = async (mealType, food) => {
    if (!token) return;
    const log = await addMealLog(token, {
      log_date: getTodayString(),
      meal_type: mealType,
      food_name: food.name,
      kcal: food.kcal,
    });
    setMeals(prev => ({
      ...prev,
      [mealType]: [...prev[mealType], { id: log.id, name: log.food_name, kcal: log.kcal }],
    }));
  };

  const removeFromMeal = async (mealType, index) => {
    if (!token) return;
    const item = meals[mealType][index];
    // Optimistically remove from UI, then delete from DB.
    setMeals(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index),
    }));
    await deleteMealLog(token, item.id);
  };

  const totalCalories = useMemo(() => {
    return Object.values(meals)
      .flat()
      .reduce((sum, item) => sum + item.kcal, 0);
  }, [meals]);

  return {
    meals,
    addToMeal,
    removeFromMeal,
    totalCalories,
  };
}