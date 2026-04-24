import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MealSection from '@/components/nutritionHub/MealSection';

const noopDrag = vi.fn();
const noopDrop = vi.fn();
const noopRemove = vi.fn();

function renderSection({ mealType = 'breakfast', items = [], onRemove = noopRemove } = {}) {
  return render(
    <MealSection
      mealType={mealType}
      items={items}
      onDragOver={noopDrag}
      onDragLeave={noopDrag}
      onDrop={noopDrop}
      onRemove={onRemove}
    />,
  );
}

describe('MealSection', () => {
  it('renders a capitalised heading for the meal type', () => {
    renderSection({ mealType: 'breakfast' });
    expect(screen.getByRole('heading', { name: 'Breakfast' })).toBeInTheDocument();
  });

  it('capitalises multi-word meal types correctly', () => {
    renderSection({ mealType: 'misc' });
    expect(screen.getByRole('heading', { name: 'Misc' })).toBeInTheDocument();
  });

  it('shows no kcal total when there are no items', () => {
    renderSection({ mealType: 'lunch', items: [] });
    expect(screen.queryByText(/^\d+ kcal$/)).not.toBeInTheDocument();
  });

  it('shows kcal inline for each logged item', () => {
    const items = [
      { id: 1, name: 'Apple', kcal: 95 },
      { id: 2, name: 'Banana', kcal: 105 },
    ];
    renderSection({ mealType: 'lunch', items });
    expect(screen.getByText('95 kcal')).toBeInTheDocument();
    expect(screen.getByText('105 kcal')).toBeInTheDocument();
  });

  it('shows the drop placeholder when the section is empty', () => {
    renderSection({ mealType: 'dinner', items: [] });
    expect(screen.getByText('Drop dinner here')).toBeInTheDocument();
  });

  it('does not show the drop placeholder when items are present', () => {
    renderSection({ mealType: 'dinner', items: [{ id: 1, name: 'Rice', kcal: 300 }] });
    expect(screen.queryByText('Drop dinner here')).not.toBeInTheDocument();
  });

  it('renders item names', () => {
    const items = [{ id: 1, name: 'Chicken Breast', kcal: 165 }];
    renderSection({ items });
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
  });

  it('renders item calories inline', () => {
    const items = [{ id: 1, name: 'Oats', kcal: 150 }];
    renderSection({ items });
    expect(screen.getByText('150 kcal')).toBeInTheDocument();
  });

  it('renders a remove button for each item', () => {
    const items = [
      { id: 1, name: 'Egg', kcal: 70 },
      { id: 2, name: 'Toast', kcal: 80 },
    ];
    renderSection({ items });
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('calls onRemove with mealType and item index when remove is clicked', () => {
    const onRemove = vi.fn();
    const items = [{ id: 1, name: 'Yogurt', kcal: 100 }];
    renderSection({ mealType: 'breakfast', items, onRemove });
    fireEvent.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledWith('breakfast', 0);
  });

  it('calls onRemove with the correct index for the second item', () => {
    const onRemove = vi.fn();
    const items = [
      { id: 1, name: 'Apple', kcal: 95 },
      { id: 2, name: 'Peanut Butter', kcal: 190 },
    ];
    renderSection({ mealType: 'misc', items, onRemove });
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(onRemove).toHaveBeenCalledWith('misc', 1);
  });

  it('calls onDrop with the event and mealType when a drop occurs', () => {
    const onDrop = vi.fn();
    const { container } = render(
      <MealSection
        mealType="lunch"
        items={[]}
        onDragOver={vi.fn()}
        onDragLeave={vi.fn()}
        onDrop={onDrop}
        onRemove={vi.fn()}
      />,
    );
    fireEvent.drop(container.querySelector('.meal-section'));
    expect(onDrop).toHaveBeenCalledWith(expect.any(Object), 'lunch');
  });

  it('calls onDragOver when dragging over the section', () => {
    const onDragOver = vi.fn();
    const { container } = render(
      <MealSection
        mealType="dinner"
        items={[]}
        onDragOver={onDragOver}
        onDragLeave={vi.fn()}
        onDrop={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    fireEvent.dragOver(container.querySelector('.meal-section'));
    expect(onDragOver).toHaveBeenCalled();
  });
});
