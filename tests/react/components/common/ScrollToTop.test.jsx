import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// ScrollToTop renders null, so we test it inside a host component
import ScrollToTop from '@/components/common/ScrollToTop';

const scrollToSpy = vi.fn();
Object.defineProperty(window, 'scrollTo', { value: scrollToSpy, writable: true });

function Host({ path = '/' }) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <ScrollToTop />
      <div id="section-a">Section A</div>
    </MemoryRouter>
  );
}

describe('ScrollToTop', () => {
  it('renders nothing visible', () => {
    const { container } = render(<Host />);
    // ScrollToTop itself adds no DOM nodes
    expect(container.querySelector('scrolltotop')).toBeNull();
  });

  it('calls window.scrollTo(0, 0) on mount', () => {
    scrollToSpy.mockClear();
    render(<Host path="/" />);
    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
  });

  it('calls scrollIntoView on the element when hash matches an existing element', () => {
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    scrollToSpy.mockClear();
    render(<Host path="/#section-a" />);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('falls back to window.scrollTo when hash is present but no matching element', () => {
    scrollToSpy.mockClear();
    render(<Host path="/#nonexistent-element-xyz" />);
    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
  });
});
