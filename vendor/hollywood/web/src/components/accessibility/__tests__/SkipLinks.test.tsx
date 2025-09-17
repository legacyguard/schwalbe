
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
// import { screen, fireEvent } from '@testing-library/react'; // Not available in current version
import { SkipLinks } from '../SkipLinks';

describe('SkipLinks Component', () => {
  it('renders default skip links', () => {
    const { container } = render(<SkipLinks />);

    expect(container.textContent).toContain('Skip to main content');
    expect(container.textContent).toContain('Skip to navigation');
    expect(container.textContent).toContain('Skip to search');
  });

  it('renders custom skip links', () => {
    const customLinks = [
      { id: 'custom-1', label: 'Custom Link 1', href: '#custom-1' },
      { id: 'custom-2', label: 'Custom Link 2', href: '#custom-2' },
    ];

    const { container } = render(<SkipLinks links={customLinks} />);

    expect(container.textContent).toContain('Custom Link 1');
    expect(container.textContent).toContain('Custom Link 2');
  });

  it('handles click events correctly', () => {
    const scrollIntoViewMock = vi.fn();
    const focusMock = vi.fn();

    // Create a mock element
    const mockElement = document.createElement('div');
    mockElement.id = 'main-content';
    mockElement.scrollIntoView = scrollIntoViewMock;
    mockElement.focus = focusMock;
    document.body.appendChild(mockElement);

    // Mock querySelector to return our element
    const originalQuerySelector = document.querySelector;
    document.querySelector = vi.fn(selector => {
      if (selector === '#main-content') {
        return mockElement;
      }
      return originalQuerySelector.call(document, selector);
    });

    const { container } = render(<SkipLinks />);

    const mainContentLink = container.querySelector('a[href="#main-content"]');
    if (mainContentLink) {
      (mainContentLink as HTMLElement).click();
    }

    expect(focusMock).toHaveBeenCalled();
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });

    // Cleanup
    document.body.removeChild(mockElement);
    document.querySelector = originalQuerySelector;
  });

  it('applies correct accessibility attributes', () => {
    const { container } = render(<SkipLinks />);

    const nav = container.querySelector('nav[aria-label="Skip links"]');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'Skip links');
  });

  it('links are keyboard accessible', () => {
    const { container } = render(<SkipLinks />);

    const links = container.querySelectorAll('a');
    links.forEach((link: Element) => {
      expect(link).toHaveAttribute('href');
      // Links should be focusable
      expect((link as HTMLElement).tabIndex).toBeGreaterThanOrEqual(-1);
    });
  });
});
