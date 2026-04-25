import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/utils/api', () => ({
  getTemplates: vi.fn(),
  getTemplateExercises: vi.fn(),
}));

vi.mock('@/components/workoutTemplate/TemplateDetailPanel', () => ({
  default: ({ template, onClose }) => (
    <div data-testid="detail-panel">
      <span>{template.name}</span>
      <button onClick={onClose}>Close Panel</button>
    </div>
  ),
}));

import TemplatesView from '@/components/workoutTemplate/TemplatesView';
import { getTemplates, getTemplateExercises } from '@/utils/api';

const mockTemplates = [
  { id: 1, name: 'Push Day', description: 'Chest and triceps', exercises: [] },
  { id: 2, name: 'Pull Day', description: 'Back and biceps', exercises: [{ id: 'e1' }] },
];

describe('TemplatesView', () => {
  beforeEach(() => {
    getTemplates.mockResolvedValue(mockTemplates);
    getTemplateExercises.mockResolvedValue({ exercises: [] });
  });

  it('renders template cards after loading', async () => {
    render(<TemplatesView />);
    await waitFor(() => expect(screen.getByText('Push Day')).toBeInTheDocument());
    expect(screen.getByText('Pull Day')).toBeInTheDocument();
  });

  it('renders a "Use Template" button for each template', async () => {
    render(<TemplatesView />);
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Use Template' })).toHaveLength(2));
  });

  it('shows exercise count in each card', async () => {
    render(<TemplatesView />);
    await waitFor(() => expect(screen.getByText('0 EXERCISES')).toBeInTheDocument());
    expect(screen.getByText('1 EXERCISES')).toBeInTheDocument();
  });

  it('opens the TemplateDetailPanel when "Use Template" is clicked', async () => {
    render(<TemplatesView />);
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Use Template' })).toHaveLength(2));
    fireEvent.click(screen.getAllByRole('button', { name: 'Use Template' })[0]);
    await waitFor(() => expect(screen.getByTestId('detail-panel')).toBeInTheDocument());
    expect(screen.getByTestId('detail-panel')).toHaveTextContent('Push Day');
  });

  it('calls getTemplateExercises with the correct template id', async () => {
    render(<TemplatesView />);
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Use Template' })).toHaveLength(2));
    fireEvent.click(screen.getAllByRole('button', { name: 'Use Template' })[1]);
    expect(getTemplateExercises).toHaveBeenCalledWith(2);
  });

  it('closes the panel when onClose is called', async () => {
    render(<TemplatesView />);
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Use Template' })).toHaveLength(2));
    fireEvent.click(screen.getAllByRole('button', { name: 'Use Template' })[0]);
    await waitFor(() => expect(screen.getByTestId('detail-panel')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Close Panel' }));
    expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
  });

  it('renders nothing in the grid when the API returns an empty array', async () => {
    getTemplates.mockResolvedValue([]);
    const { container } = render(<TemplatesView />);
    await waitFor(() => expect(getTemplates).toHaveBeenCalled());
    expect(container.querySelectorAll('.wt-template-card')).toHaveLength(0);
  });

  it('shows 0 exercise count when template has no exercises array', async () => {
    getTemplates.mockResolvedValue([{ id: 3, name: 'No Exercises Template', description: 'Test' }]);
    render(<TemplatesView />);
    await waitFor(() => expect(screen.getByText('No Exercises Template')).toBeInTheDocument());
    expect(screen.getByText('0 EXERCISES')).toBeInTheDocument();
  });
});
