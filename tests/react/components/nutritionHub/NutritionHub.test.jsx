import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/assets/food_pyramid.jpg', () => ({ default: 'food_pyramid.jpg' }));

const mockAddToMeal = vi.fn();
const mockRemoveFromMeal = vi.fn();
const mockUseFoodSearch = vi.fn();

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
  useFoodSearch: () => mockUseFoodSearch(),
}));

const defaultFoodSearchReturn = {
  searchQuery: '',
  setSearchQuery: vi.fn(),
  searchResults: [],
  isSearching: false,
  customName: '',
  setCustomName: vi.fn(),
  customKcal: '',
  setCustomKcal: vi.fn(),
  customProtein: '',
  setCustomProtein: vi.fn(),
  customCarbs: '',
  setCustomCarbs: vi.fn(),
  customFat: '',
  setCustomFat: vi.fn(),
  handleAddCustom: vi.fn(),
};

import NutritionPage from '@/components/nutritionHub/NutritionHub';

function renderPage() {
  return render(<NutritionPage />);
}

describe('NutritionHub (NutritionPage)', () => {
  beforeEach(() => {
    mockAddToMeal.mockReset();
    mockRemoveFromMeal.mockReset();
    mockUseFoodSearch.mockReturnValue(defaultFoodSearchReturn);
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

  it('adds drag-over class when dragover fires on a meal section', () => {
    const { container } = renderPage();
    const section = container.querySelector('.meal-section');
    fireEvent.dragOver(section);
    expect(section).toHaveClass('drag-over');
  });

  it('removes drag-over class when dragleave fires on a meal section', () => {
    const { container } = renderPage();
    const section = container.querySelector('.meal-section');
    // first add the class via dragover
    fireEvent.dragOver(section);
    expect(section).toHaveClass('drag-over');
    // then remove via dragleave
    fireEvent.dragLeave(section);
    expect(section).not.toHaveClass('drag-over');
  });

  it('calls dataTransfer.setData when handleDragStart is invoked via a draggable food item', () => {
    const food = { name: 'Chicken', kcal: 200, serving_description: '100g' };
    mockUseFoodSearch.mockReturnValue({
      ...defaultFoodSearchReturn,
      searchResults: [food],
    });
    const { container } = renderPage();
    const draggable = container.querySelector('.draggable-food');
    expect(draggable).not.toBeNull();

    const setData = vi.fn();
    const dragStartEvent = new Event('dragstart', { bubbles: true });
    Object.defineProperty(dragStartEvent, 'dataTransfer', {
      value: { setData, effectAllowed: '' },
      writable: false,
    });
    fireEvent(draggable, dragStartEvent);
    expect(setData).toHaveBeenCalledWith('application/json', JSON.stringify(food));
  });
});
