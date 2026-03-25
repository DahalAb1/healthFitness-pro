import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/components/common/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('@/components/common/Footer', () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock('@/components/workoutTemplate/WorkoutTemplateHero', () => ({
  default: () => <div data-testid="template-hero" />,
}));
vi.mock('@/components/workoutTemplate/WorkoutViewSwitcher', () => ({
  default: ({ activeView, setActiveView }) => (
    <div data-testid="view-switcher">
      <button onClick={() => setActiveView('templates')}>Templates</button>
      <button onClick={() => setActiveView('custom')}>Custom</button>
      <span data-testid="active-view">{activeView}</span>
    </div>
  ),
}));
vi.mock('@/components/workoutTemplate/TemplatesView', () => ({
  default: () => <div data-testid="templates-view" />,
}));
vi.mock('@/components/workoutTemplate/CustomCreatorView', () => ({
  default: () => <div data-testid="custom-creator-view" />,
}));

import WorkoutTemplatePage from '@/pages/WorkoutTemplatePage';

function renderPage() {
  return render(
    <MemoryRouter>
      <WorkoutTemplatePage />
    </MemoryRouter>,
  );
}

describe('WorkoutTemplatePage', () => {
  it('renders Navbar and Footer', () => {
    renderPage();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders the hero and view switcher', () => {
    renderPage();
    expect(screen.getByTestId('template-hero')).toBeInTheDocument();
    expect(screen.getByTestId('view-switcher')).toBeInTheDocument();
  });

  it('shows TemplatesView by default', () => {
    renderPage();
    expect(screen.getByTestId('templates-view')).toBeInTheDocument();
    expect(screen.queryByTestId('custom-creator-view')).not.toBeInTheDocument();
  });

  it('switches to CustomCreatorView when activeView is set to "custom"', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Custom' }));
    expect(screen.getByTestId('custom-creator-view')).toBeInTheDocument();
    expect(screen.queryByTestId('templates-view')).not.toBeInTheDocument();
  });

  it('switches back to TemplatesView from CustomCreatorView', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Custom' }));
    fireEvent.click(screen.getByRole('button', { name: 'Templates' }));
    expect(screen.getByTestId('templates-view')).toBeInTheDocument();
  });
});
