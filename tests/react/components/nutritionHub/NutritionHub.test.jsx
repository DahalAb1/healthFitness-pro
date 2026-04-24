import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/assets/food_pyramid.jpg', () => ({ default: 'food_pyramid.jpg' }));

const mockAddToMeal = vi.fn();
const mockRemoveFromMeal = vi.fn();

vi.mock('@/hooks/useMeals', () => ({
  MEAL_TYPES: ['breakfast', 'lunch', 'dinner', 'misc'],
  useMeals: () => ({
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      misc: [],
    },
    addToMeal: mockAddToMeal,
    removeFromMeal: mockRemoveFromMeal,
    totalCalories: 0,
    totalMacros: { protein_g: 0, carbs_g: 0, fat_g: 0 },
  }),
}));

vi.mock('@/hooks/useFoodSearch', () => ({
  useFoodSearch: () => ({
    searchQuery: '',
    setSearchQuery: vi.fn(),
    searchResults: [],
    isSearching: false,
    customName: '',
    setCustomName: vi.fn(),
    customKcal: '',
    setCustomKcal: vi.fn(),
    handleAddCustom: vi.fn(),
  }),
}));

import NutritionPage from '@/components/nutritionHub/NutritionHub';

function renderPage() {
  return render(<NutritionPage />);
}

describe('NutritionHub (NutritionPage)', () => {
  beforeEach(() => {
    mockAddToMeal.mockReset();
    mockRemoveFromMeal.mockReset();
  });

  it('renders the "Nutrition" page heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Nutrition' })).toBeInTheDocument();
  });

  it('renders the Breakfast meal section', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Breakfast' })).toBeInTheDocument();
  });

  it('renders the Lunch meal section', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Lunch' })).toBeInTheDocument();
  });

  it('renders the Dinner meal section', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Dinner' })).toBeInTheDocument();
  });

  it('renders the Misc meal section', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Misc' })).toBeInTheDocument();
  });

  it('renders all four drop-placeholder messages when sections are empty', () => {
    renderPage();
    expect(screen.getByText('Drop breakfast here')).toBeInTheDocument();
    expect(screen.getByText('Drop lunch here')).toBeInTheDocument();
    expect(screen.getByText('Drop dinner here')).toBeInTheDocument();
    expect(screen.getByText('Drop misc here')).toBeInTheDocument();
  });

  it('renders the food search input', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders the calorie goal input', () => {
    renderPage();
    // Both the CalorieGauge goal field and the FoodSearch kcal field are spinbuttons
    const spinbuttons = screen.getAllByRole('spinbutton');
    expect(spinbuttons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the custom food name input', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Food Name')).toBeInTheDocument();
  });

  it('renders the daily goal label', () => {
    renderPage();
    expect(screen.getByText('Goal (kcal)')).toBeInTheDocument();
  });

  it('renders 0 total calories in the gauge when no food is logged', () => {
    renderPage();
    // goal defaults to 2500, total is 0 → remaining = 2500, unit = kcal
    expect(screen.getByText('2500kcal')).toBeInTheDocument();
  });

  it('calls addToMeal when a food item is dropped onto a meal section', () => {
    renderPage();
    const food = { name: 'Apple', kcal: 95 };
    const section = screen.getByText('Drop breakfast here').closest('.meal-section');

    // Simulate a drop event carrying food JSON
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        getData: () => JSON.stringify(food),
        effectAllowed: 'copy',
      },
    });
    fireEvent(section, dropEvent);
    expect(mockAddToMeal).toHaveBeenCalledWith('breakfast', food);
  });
});
