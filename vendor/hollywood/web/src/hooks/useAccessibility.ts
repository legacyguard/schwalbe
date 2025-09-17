
/**
 * React hooks for accessibility features
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  announceToScreenReader,
  generateAriaId,
  KEYBOARD_KEYS,
  prefersHighContrast,
  prefersReducedMotion,
  trapFocus,
} from '@/lib/accessibility/a11y-utils';

/**
 * Hook for managing focus trap
 */
export const useFocusTrap = (isActive: boolean = true) => {
  const ref = useRef<HTMLElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      cleanupRef.current = trapFocus(ref.current);
    }

    return () => {
      cleanupRef.current?.();
    };
  }, [isActive]);

  return ref;
};

/**
 * Hook for screen reader announcements
 */
export const useAnnouncement = () => {
  const announce = useCallback(
    (message: string, priority: 'assertive' | 'polite' = 'polite') => {
      announceToScreenReader(message, priority);
    },
    []
  );

  return announce;
};

/**
 * Hook for keyboard navigation
 */
export const useKeyboardNavigation = (
  items: any[],
  options: {
    loop?: boolean;
    onSelect?: (item: unknown, index: number) => void;
    orientation?: 'both' | 'horizontal' | 'vertical';
  } = {}
) => {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { key } = event;
      let newIndex = focusedIndex;

      switch (key) {
        case KEYBOARD_KEYS.ARROW_UP:
          if (orientation !== 'horizontal') {
            event.preventDefault();
            newIndex = focusedIndex - 1;
            if (newIndex < 0) {
              newIndex = loop ? items.length - 1 : 0;
            }
          }
          break;

        case KEYBOARD_KEYS.ARROW_DOWN:
          if (orientation !== 'horizontal') {
            event.preventDefault();
            newIndex = focusedIndex + 1;
            if (newIndex >= items.length) {
              newIndex = loop ? 0 : items.length - 1;
            }
          }
          break;

        case KEYBOARD_KEYS.ARROW_LEFT:
          if (orientation !== 'vertical') {
            event.preventDefault();
            newIndex = focusedIndex - 1;
            if (newIndex < 0) {
              newIndex = loop ? items.length - 1 : 0;
            }
          }
          break;

        case KEYBOARD_KEYS.ARROW_RIGHT:
          if (orientation !== 'vertical') {
            event.preventDefault();
            newIndex = focusedIndex + 1;
            if (newIndex >= items.length) {
              newIndex = loop ? 0 : items.length - 1;
            }
          }
          break;

        case KEYBOARD_KEYS.HOME:
          event.preventDefault();
          newIndex = 0;
          break;

        case KEYBOARD_KEYS.END:
          event.preventDefault();
          newIndex = items.length - 1;
          break;

        case KEYBOARD_KEYS.ENTER:
        case KEYBOARD_KEYS.SPACE:
          event.preventDefault();
          onSelect?.(items[focusedIndex], focusedIndex);
          break;

        default:
          break;
      }

      if (newIndex !== focusedIndex) {
        setFocusedIndex(newIndex);
      }
    },
    [focusedIndex, items.length, loop, onSelect, orientation]
  );

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  };
};

/**
 * Hook for detecting user preferences
 */
export const useAccessibilityPreferences = () => {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion());
  const [highContrast, setHighContrast] = useState(prefersHighContrast());

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  return {
    reducedMotion,
    highContrast,
  };
};

/**
 * Hook for generating ARIA IDs
 */
export const useAriaId = (prefix: string = 'aria') => {
  const [id] = useState(() => generateAriaId(prefix));
  return id;
};

/**
 * Hook for roving tabindex pattern
 */
export const useRovingTabIndex = (
  _items: any[],
  activeIndex: number = 0
) => {
  const [currentIndex, setCurrentIndex] = useState(activeIndex);

  const getRovingProps = useCallback(
    (index: number) => ({
      tabIndex: index === currentIndex ? 0 : -1,
      onFocus: () => setCurrentIndex(index),
    }),
    [currentIndex]
  );

  return {
    currentIndex,
    setCurrentIndex,
    getRovingProps,
  };
};

/**
 * Hook for live region announcements
 */
export const useLiveRegion = (
  ariaLive: 'assertive' | 'off' | 'polite' = 'polite'
) => {
  const [message, setMessage] = useState('');
  const regionRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((text: string) => {
    setMessage(text);
    // Clear message after announcement
    setTimeout(() => setMessage(''), 100);
  }, []);

  const regionProps = {
    'aria-live': ariaLive,
    'aria-atomic': 'true',
    className: 'sr-only',
    children: message,
  };

  return {
    regionProps,
    announce,
    regionRef,
  };
};
