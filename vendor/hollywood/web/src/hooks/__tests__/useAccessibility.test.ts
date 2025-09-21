
import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useAccessibilityPreferences,
  useAnnouncement,
  useAriaId,
  useKeyboardNavigation,
  useLiveRegion,
  useRovingTabIndex,
} from '../useAccessibility';

describe('useAccessibility Hooks', () => {
  describe('useAnnouncement', () => {
    it('calls announceToScreenReader with correct parameters', () => {
      const { result } = renderHook(() => useAnnouncement());

      // Create a temporary element to test announcement
      const tempDiv = document.createElement('div');
      document.body.appendChild(tempDiv);

      act(() => {
        result.current('Test message', 'assertive');
      });

      // Check that an announcement element was created
      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).toBeTruthy();

      // Cleanup
      document.body.innerHTML = '';
    });
  });

  describe('useKeyboardNavigation', () => {
    it('handles arrow key navigation correctly', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      const onSelect = vi.fn();

      const { result } = renderHook(() =>
        useKeyboardNavigation(items, { onSelect })
      );

      expect(result.current.focusedIndex).toBe(0);

      // Test arrow down
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        result.current.handleKeyDown(event as any);
      });

      expect(result.current.focusedIndex).toBe(1);

      // Test arrow up
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        result.current.handleKeyDown(event as any);
      });

      expect(result.current.focusedIndex).toBe(0);

      // Test Enter key selection
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        result.current.handleKeyDown(event as any);
      });

      expect(onSelect).toHaveBeenCalledWith('Item 1', 0);
    });

    it('handles Home and End keys', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];

      const { result } = renderHook(() => useKeyboardNavigation(items));

      // Test End key
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'End' });
        result.current.handleKeyDown(event as any);
      });

      expect(result.current.focusedIndex).toBe(2);

      // Test Home key
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Home' });
        result.current.handleKeyDown(event as any);
      });

      expect(result.current.focusedIndex).toBe(0);
    });

    it('supports loop navigation', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];

      const { result } = renderHook(() =>
        useKeyboardNavigation(items, { loop: true })
      );

      // Navigate to last item
      act(() => {
        result.current.setFocusedIndex(2);
      });

      // Test loop to first item
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        result.current.handleKeyDown(event as any);
      });

      expect(result.current.focusedIndex).toBe(0);

      // Test loop to last item
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        result.current.handleKeyDown(event as any);
      });

      expect(result.current.focusedIndex).toBe(2);
    });
  });

  describe('useAccessibilityPreferences', () => {
    it('detects user preferences correctly', () => {
      const { result } = renderHook(() => useAccessibilityPreferences());

      // Default values (based on our mock)
      expect(result.current.reducedMotion).toBe(false);
      expect(result.current.highContrast).toBe(false);
    });
  });

  describe('useAriaId', () => {
    it('generates unique IDs', () => {
      const { result: result1 } = renderHook(() => useAriaId('test'));
      const { result: result2 } = renderHook(() => useAriaId('test'));

      expect(result1.current).toBeTruthy();
      expect(result2.current).toBeTruthy();
      expect(result1.current).not.toBe(result2.current);
      expect(result1.current).toContain('test');
    });
  });

  describe('useRovingTabIndex', () => {
    it('manages roving tabindex correctly', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];

      const { result } = renderHook(() => useRovingTabIndex(items, 1));

      expect(result.current.currentIndex).toBe(1);

      // Get props for each item
      const props0 = result.current.getRovingProps(0);
      const props1 = result.current.getRovingProps(1);
      const props2 = result.current.getRovingProps(2);

      expect(props0.tabIndex).toBe(-1);
      expect(props1.tabIndex).toBe(0);
      expect(props2.tabIndex).toBe(-1);

      // Simulate focus on item 2
      act(() => {
        props2.onFocus();
      });

      expect(result.current.currentIndex).toBe(2);
    });
  });

  describe('useLiveRegion', () => {
    it('manages live region announcements', () => {
      const { result } = renderHook(() => useLiveRegion('polite'));

      expect(result.current.regionProps['aria-live']).toBe('polite');
      expect(result.current.regionProps['aria-atomic']).toBe('true');
      expect(result.current.regionProps.className).toBe('sr-only');

      act(() => {
        result.current.announce('Test announcement');
      });

      expect(result.current.regionProps.children).toBe('Test announcement');
    });
  });
});
