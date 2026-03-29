import { useEffect, useMemo, useState } from 'react';

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'misc'];

const STORAGE_KEY = 'nutrition_tracker_data';

const emptyMeals = () => Object.fromEntries(MEAL_TYPES.map(t => [t, []]));

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const hasMealData = (meals) => {
  return Object.values(meals).some(items => items.length > 0);
};

const createDefaultData = () => ({
  currentDate: getTodayString(),
  meals: emptyMeals(),
  history: [],
});

const loadStoredData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultData();

    const parsed = JSON.parse(raw);

    return {
      currentDate: parsed.currentDate || getTodayString(),
      meals: parsed.meals || emptyMeals(),
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return createDefaultData();
  }
};

/**
 * Encapsulates all meal log concerns:
 *  - meal state keyed by meal type
 *  - adding a food item to a meal
 *  - removing a food item from a meal
 *  - daily reset when date changes
 *  - preserving previous days in history
 *
 * SRP: this hook is the single source of truth for the daily meal log.
 */
export function useMeals() {
  const [trackerData, setTrackerData] = useState(() => {
    const stored = loadStoredData();
    const today = getTodayString();

    if (stored.currentDate !== today) {
      const updatedHistory = hasMealData(stored.meals)
        ? [
            ...stored.history.filter(entry => entry.date !== stored.currentDate),
            { date: stored.currentDate, meals: stored.meals },
          ]
        : stored.history;

      return {
        currentDate: today,
        meals: emptyMeals(),
        history: updatedHistory,
      };
    }

    return stored;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trackerData));
  }, [trackerData]);

  const addToMeal = (mealType, food) => {
    setTrackerData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: [...prev.meals[mealType], food],
      },
    }));
  };

  const removeFromMeal = (mealType, index) => {
    setTrackerData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [mealType]: prev.meals[mealType].filter((_, i) => i !== index),
      },
    }));
  };

  const resetIfNewDay = () => {
    const today = getTodayString();

    setTrackerData(prev => {
      if (prev.currentDate === today) return prev;

      const updatedHistory = hasMealData(prev.meals)
        ? [
            ...prev.history.filter(entry => entry.date !== prev.currentDate),
            { date: prev.currentDate, meals: prev.meals },
          ]
        : prev.history;

      return {
        currentDate: today,
        meals: emptyMeals(),
        history: updatedHistory,
      };
    });
  };

  useEffect(() => {
    resetIfNewDay();
  }, []);

  const totalCalories = useMemo(() => {
    return Object.values(trackerData.meals)
      .flat()
      .reduce((sum, item) => sum + item.kcal, 0);
  }, [trackerData.meals]);

  return {
    meals: trackerData.meals,
    history: trackerData.history,
    currentDate: trackerData.currentDate,
    addToMeal,
    removeFromMeal,
    totalCalories,
    resetIfNewDay,
  };
}