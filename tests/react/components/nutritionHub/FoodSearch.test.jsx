import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FoodSearch from '@/components/nutritionHub/FoodSearch';

const defaultProps = {
  searchQuery: '',
  onSearchChange: vi.fn(),
  searchResults: [],
  isSearching: false,
  onDragStart: vi.fn(),
  customName: '',
  customKcal: '',
  customProtein: '',
  customCarbs: '',
  customFat: '',
  onCustomNameChange: vi.fn(),
  onCustomKcalChange: vi.fn(),
  onCustomProteinChange: vi.fn(),
  onCustomCarbsChange: vi.fn(),
  onCustomFatChange: vi.fn(),
  onAddCustom: vi.fn(),
};

function renderSearch(overrides = {}) {
  return render(<FoodSearch {...defaultProps} {...overrides} />);
}

describe('FoodSearch', () => {
  it('renders the "Find Food" label', () => {
    renderSearch();
    expect(screen.getByText('Find Food')).toBeInTheDocument();
  });

  it('renders the search input', () => {
    renderSearch();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('reflects the current searchQuery in the input', () => {
    renderSearch({ searchQuery: 'chicken' });
    expect(screen.getByPlaceholderText('Search...')).toHaveValue('chicken');
  });

  it('calls onSearchChange when the search input changes', () => {
    const onSearchChange = vi.fn();
    renderSearch({ onSearchChange });
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'eggs' } });
    expect(onSearchChange).toHaveBeenCalledWith('eggs');
  });

  it('shows "Searching..." when isSearching is true', () => {
    renderSearch({ isSearching: true, searchQuery: 'apple' });
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('does not show "Searching..." when isSearching is false', () => {
    renderSearch({ isSearching: false });
    expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
  });

  it('shows "No results found." when a query yields no results and not searching', () => {
    renderSearch({ searchQuery: 'xyz123', searchResults: [], isSearching: false });
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('does not show "No results found." when the search query is empty', () => {
    renderSearch({ searchQuery: '', searchResults: [], isSearching: false });
    expect(screen.queryByText('No results found.')).not.toBeInTheDocument();
  });

  it('does not show "No results found." while a search is in progress', () => {
    renderSearch({ searchQuery: 'apple', searchResults: [], isSearching: true });
    expect(screen.queryByText('No results found.')).not.toBeInTheDocument();
  });

  it('renders food result names', () => {
    const results = [
      { name: 'Apple', kcal: 95, serving_description: '1 medium' },
      { name: 'Banana', kcal: 105, serving_description: '' },
    ];
    renderSearch({ searchResults: results });
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('renders calorie counts for food results', () => {
    const results = [{ name: 'Oats', kcal: 150, serving_description: '' }];
    renderSearch({ searchResults: results });
    expect(screen.getByText('150 kcal')).toBeInTheDocument();
  });

  it('renders the serving description when provided', () => {
    const results = [{ name: 'Chicken Breast', kcal: 165, serving_description: '100g' }];
    renderSearch({ searchResults: results });
    expect(screen.getByText('100g')).toBeInTheDocument();
  });

  it('food result items are marked as draggable', () => {
    const results = [{ name: 'Rice', kcal: 200, serving_description: '' }];
    const { container } = renderSearch({ searchResults: results });
    const draggable = container.querySelector('.draggable-food');
    expect(draggable).toHaveAttribute('draggable', 'true');
  });

  it('calls onDragStart when a food item drag begins', () => {
    const onDragStart = vi.fn();
    const results = [{ name: 'Pasta', kcal: 220, serving_description: '' }];
    const { container } = renderSearch({ searchResults: results, onDragStart });
    fireEvent.dragStart(container.querySelector('.draggable-food'));
    expect(onDragStart).toHaveBeenCalledWith(expect.any(Object), results[0]);
  });

  it('renders the custom food name input', () => {
    renderSearch();
    expect(screen.getByPlaceholderText('Food Name')).toBeInTheDocument();
  });

  it('renders the custom calorie input', () => {
    renderSearch();
    expect(screen.getByPlaceholderText('Calories')).toBeInTheDocument();
  });

  it('reflects customName in the name input', () => {
    renderSearch({ customName: 'My Bar' });
    expect(screen.getByPlaceholderText('Food Name')).toHaveValue('My Bar');
  });

  it('reflects customKcal in the calorie input', () => {
    renderSearch({ customKcal: '300' });
    expect(screen.getByPlaceholderText('Calories')).toHaveValue(300);
  });

  it('calls onCustomNameChange when the name input changes', () => {
    const onCustomNameChange = vi.fn();
    renderSearch({ onCustomNameChange });
    fireEvent.change(screen.getByPlaceholderText('Food Name'), { target: { value: 'Protein Bar' } });
    expect(onCustomNameChange).toHaveBeenCalledWith('Protein Bar');
  });

  it('calls onCustomKcalChange when the calorie input changes', () => {
    const onCustomKcalChange = vi.fn();
    renderSearch({ onCustomKcalChange });
    fireEvent.change(screen.getByPlaceholderText('Calories'), { target: { value: '250' } });
    expect(onCustomKcalChange).toHaveBeenCalledWith('250');
  });

  it('renders the "Add to Results" button', () => {
    renderSearch();
    expect(screen.getByRole('button', { name: 'Add to Results' })).toBeInTheDocument();
  });

  it('calls onAddCustom when the "Add to Results" button is clicked', () => {
    const onAddCustom = vi.fn();
    renderSearch({ onAddCustom });
    fireEvent.click(screen.getByRole('button', { name: 'Add to Results' }));
    expect(onAddCustom).toHaveBeenCalledTimes(1);
  });

  it('renders the "Quick Custom Log" label', () => {
    renderSearch();
    expect(screen.getByText('Quick Custom Log')).toBeInTheDocument();
  });

  it('renders the Protein (g) input', () => {
    renderSearch();
    expect(screen.getByPlaceholderText('Protein (g)')).toBeInTheDocument();
  });

  it('renders the Carbs (g) input', () => {
    renderSearch();
    expect(screen.getByPlaceholderText('Carbs (g)')).toBeInTheDocument();
  });

  it('renders the Fat (g) input', () => {
    renderSearch();
    expect(screen.getByPlaceholderText('Fat (g)')).toBeInTheDocument();
  });

  it('reflects customProtein in the Protein input', () => {
    renderSearch({ customProtein: '25' });
    expect(screen.getByPlaceholderText('Protein (g)')).toHaveValue(25);
  });

  it('reflects customCarbs in the Carbs input', () => {
    renderSearch({ customCarbs: '40' });
    expect(screen.getByPlaceholderText('Carbs (g)')).toHaveValue(40);
  });

  it('reflects customFat in the Fat input', () => {
    renderSearch({ customFat: '10' });
    expect(screen.getByPlaceholderText('Fat (g)')).toHaveValue(10);
  });

  it('calls onCustomProteinChange when the Protein input changes', () => {
    const onCustomProteinChange = vi.fn();
    renderSearch({ onCustomProteinChange });
    fireEvent.change(screen.getByPlaceholderText('Protein (g)'), { target: { value: '30' } });
    expect(onCustomProteinChange).toHaveBeenCalledWith('30');
  });

  it('calls onCustomCarbsChange when the Carbs input changes', () => {
    const onCustomCarbsChange = vi.fn();
    renderSearch({ onCustomCarbsChange });
    fireEvent.change(screen.getByPlaceholderText('Carbs (g)'), { target: { value: '50' } });
    expect(onCustomCarbsChange).toHaveBeenCalledWith('50');
  });

  it('calls onCustomFatChange when the Fat input changes', () => {
    const onCustomFatChange = vi.fn();
    renderSearch({ onCustomFatChange });
    fireEvent.change(screen.getByPlaceholderText('Fat (g)'), { target: { value: '15' } });
    expect(onCustomFatChange).toHaveBeenCalledWith('15');
  });

  it('renders macro pills when food has protein_g, carbs_g, and fat_g', () => {
    const results = [{ name: 'Salmon', kcal: 208, serving_description: '', protein_g: 20, carbs_g: 0, fat_g: 13 }];
    renderSearch({ searchResults: results });
    expect(screen.getByText('P 20g')).toBeInTheDocument();
    expect(screen.getByText('C 0g')).toBeInTheDocument();
    expect(screen.getByText('F 13g')).toBeInTheDocument();
  });
});
