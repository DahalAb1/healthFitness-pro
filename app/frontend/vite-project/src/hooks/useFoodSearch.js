import { useState, useEffect } from 'react';
import { searchFoods } from '../utils/api';

/**
 * Encapsulates all food search concerns:
 *  - debounced API queries
 *  - local custom-food management
 *  - merging API results with custom entries
 *
 * SRP: this hook is the single source of truth for search state.
 * DIP: NutritionHub depends on this abstraction, not on the API directly.
 */
export function useFoodSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [apiResults, setApiResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [customFoods, setCustomFoods] = useState([]);
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  useEffect(() => {
    if (!searchQuery.trim()) {
      setApiResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchFoods(searchQuery.trim());
        const normalized = (data.foods ?? []).map(f => ({
          name: f.food_name,
          kcal: Math.round(f.calories ?? 0),
          serving_description: f.serving_description ?? '',
          protein_g: f.protein_g ?? null,
          carbs_g: f.carbs_g ?? null,
          fat_g: f.fat_g ?? null,
        }));
        setApiResults(normalized);
      } catch {
        setApiResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredCustomFoods = searchQuery.trim()
    ? customFoods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : customFoods;

  const searchResults = [...filteredCustomFoods, ...apiResults];

  const handleAddCustom = () => {
    if (customName && customKcal) {
      setCustomFoods(prev => [
        {
          name: customName,
          kcal: parseInt(customKcal),
          serving_description: '',
          protein_g: customProtein !== '' ? parseFloat(customProtein) : null,
          carbs_g: customCarbs !== '' ? parseFloat(customCarbs) : null,
          fat_g: customFat !== '' ? parseFloat(customFat) : null,
        },
        ...prev,
      ]);
      setSearchQuery(customName);
      setCustomName('');
      setCustomKcal('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    customName,
    setCustomName,
    customKcal,
    setCustomKcal,
    customProtein,
    setCustomProtein,
    customCarbs,
    setCustomCarbs,
    customFat,
    setCustomFat,
    handleAddCustom,
  };
}
