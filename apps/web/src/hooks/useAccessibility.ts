import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for managing focus in accessible components
 */
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement | null>(null);

  const setFocus = useCallback((element?: HTMLElement | null) => {
    if (element) {
      focusRef.current = element;
      // Use requestAnimationFrame to ensure DOM updates have completed
      requestAnimationFrame(() => {
        element.focus();
      });
    }
  }, []);

  const restoreFocus = useCallback(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, []);

  return { setFocus, restoreFocus };
}

/**
 * Hook for announcing content to screen readers
 */
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create announcer element if it doesn't exist
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.id = 'accessibility-announcer';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
        announcerRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = message;

      // Clear the message after a brief delay to allow for re-announcing the same message
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return { announce };
}

/**
 * Hook for managing ARIA describedby relationships
 */
export function useDescribedBy(baseId: string) {
  const descriptors = useRef<Set<string>>(new Set());

  const addDescriptor = useCallback((id: string) => {
    descriptors.current.add(id);
  }, []);

  const removeDescriptor = useCallback((id: string) => {
    descriptors.current.delete(id);
  }, []);

  const getDescribedBy = useCallback(() => {
    return Array.from(descriptors.current).join(' ') || undefined;
  }, []);

  const createDescriptorId = useCallback((suffix: string) => {
    return `${baseId}-${suffix}`;
  }, [baseId]);

  return {
    addDescriptor,
    removeDescriptor,
    getDescribedBy,
    createDescriptorId
  };
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        if (onEnter && event.target instanceof HTMLElement &&
            !['button', 'a'].includes(event.target.tagName.toLowerCase())) {
          event.preventDefault();
          onEnter();
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'ArrowUp':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('up');
        }
        break;
      case 'ArrowDown':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('down');
        }
        break;
      case 'ArrowLeft':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('left');
        }
        break;
      case 'ArrowRight':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('right');
        }
        break;
    }
  }, [onEnter, onEscape, onArrowKeys]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { handleKeyDown };
}