import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AsyncState from '@/components/common/AsyncState';

describe('AsyncState', () => {
  it('renders loading text when loading is true', () => {
    render(<AsyncState loading={true}>content</AsyncState>);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders custom loadingText when provided', () => {
    render(<AsyncState loading={true} loadingText="Please wait…">content</AsyncState>);
    expect(screen.getByText('Please wait…')).toBeInTheDocument();
  });

  it('renders errorText when error is set and errorText is provided', () => {
    render(<AsyncState loading={false} error="raw error" errorText="Something went wrong">content</AsyncState>);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('falls back to the error value string when errorText is not provided', () => {
    render(<AsyncState loading={false} error="Network failure">content</AsyncState>);
    expect(screen.getByText('Network failure')).toBeInTheDocument();
  });

  it('applies async-state--error class on error', () => {
    const { container } = render(<AsyncState loading={false} error="oops">content</AsyncState>);
    expect(container.firstChild).toHaveClass('async-state--error');
  });

  it('renders emptyText when empty is true', () => {
    render(
      <AsyncState loading={false} error={null} empty={true} emptyText="No results found.">
        content
      </AsyncState>,
    );
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('renders children when not loading, no error, and not empty', () => {
    render(
      <AsyncState loading={false} error={null} empty={false}>
        <span>actual content</span>
      </AsyncState>,
    );
    expect(screen.getByText('actual content')).toBeInTheDocument();
  });

  it('loading takes priority over error and empty', () => {
    render(
      <AsyncState loading={true} error="err" empty={true} emptyText="empty">
        content
      </AsyncState>,
    );
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByText('err')).toBeNull();
    expect(screen.queryByText('empty')).toBeNull();
  });

  it('error takes priority over empty', () => {
    render(
      <AsyncState loading={false} error="err" empty={true} emptyText="empty">
        content
      </AsyncState>,
    );
    expect(screen.getByText('err')).toBeInTheDocument();
    expect(screen.queryByText('empty')).toBeNull();
  });

  it('applies extra className to loading state', () => {
    const { container } = render(
      <AsyncState loading={true} className="custom-class">content</AsyncState>,
    );
    expect(container.firstChild).toHaveClass('async-state');
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
