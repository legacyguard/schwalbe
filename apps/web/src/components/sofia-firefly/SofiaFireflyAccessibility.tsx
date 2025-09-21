import { useState, useEffect, useCallback } from 'react';

export interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusManagement: boolean;
}

export interface HapticPattern {
  type: 'light' | 'medium' | 'heavy';
  duration: number;
  pattern?: number[];
}

export const useSofiaAccessibility = () => {
  const [config, setConfig] = useState<AccessibilityConfig>({
    reducedMotion: false,
    highContrast: false,
    screenReader: false,
    keyboardNavigation: true,
    focusManagement: true,
  });

  // Detect accessibility preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const updateAccessibility = () => {
      setConfig(prev => ({
        ...prev,
        reducedMotion: mediaQuery.matches,
        highContrast: contrastQuery.matches,
      }));
    };

    // Initial check
    updateAccessibility();

    // Listen for changes
    mediaQuery.addEventListener('change', updateAccessibility);
    contrastQuery.addEventListener('change', updateAccessibility);

    // Detect screen reader (approximate detection)
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasAriaLive = document.querySelector('[aria-live]') !== null;
      const hasScreenReaderClass = document.body.classList.contains('sr-only') ||
                                   document.body.classList.contains('screen-reader-only');

      setConfig(prev => ({
        ...prev,
        screenReader: hasAriaLive || hasScreenReaderClass,
      }));
    };

    detectScreenReader();

    return () => {
      mediaQuery.removeEventListener('change', updateAccessibility);
      contrastQuery.removeEventListener('change', updateAccessibility);
    };
  }, []);

  return config;
};

// Generate accessibility announcements
export const getAccessibilityAnnouncement = (
  context: string,
  personality: string,
  action: string
): string => {
  const announcements = {
    appeared: `${personality} Sofia firefly appeared`,
    interacted: `Interacted with ${personality} Sofia firefly`,
    guiding: `${personality} Sofia is guiding you`,
    celebrating: `${personality} Sofia is celebrating with you`,
    helping: `${personality} Sofia is here to help`,
    waiting: `${personality} Sofia is patiently waiting`,
  };

  return announcements[action as keyof typeof announcements] ||
         `${personality} Sofia firefly ${action}`;
};

// Generate haptic patterns (visual feedback for web)
export const getHapticPattern = (
  context: string,
  personality: string,
  intensity: 'light' | 'medium' | 'heavy' = 'medium'
): HapticPattern => {
  const patterns: Record<'light' | 'medium' | 'heavy', HapticPattern> = {
    light: { type: 'light', duration: 100 },
    medium: { type: 'medium', duration: 200 },
    heavy: { type: 'heavy', duration: 300 },
  };

  // Adjust pattern based on personality
  const personalityMultiplier = {
    empathetic: 1.2,
    pragmatic: 0.8,
    celebratory: 1.5,
    comforting: 1.0,
  };

  const basePattern = patterns[intensity];
  const multiplier = personalityMultiplier[personality as keyof typeof personalityMultiplier] || 1.0;

  return {
    ...basePattern,
    duration: Math.round(basePattern.duration * multiplier),
  };
};

// Focus management utilities
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState<Element | null>(null);

  const focusElement = useCallback((element: Element | null) => {
    if (element && element instanceof HTMLElement) {
      element.focus();
      setFocusedElement(element);
    }
  }, []);

  const trapFocus = useCallback((container: Element) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: Event) => {
      const keyboardEvent = e as KeyboardEvent;
      if (keyboardEvent.key === 'Tab') {
        if (keyboardEvent.shiftKey) {
          if (document.activeElement === firstElement) {
            keyboardEvent.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            keyboardEvent.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    focusedElement,
    focusElement,
    trapFocus,
  };
};

// Screen reader utilities
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';

  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Keyboard navigation helpers
export const useKeyboardNavigation = () => {
  const handleKeyPress = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  const handleArrowNavigation = useCallback((
    event: React.KeyboardEvent,
    onUp?: () => void,
    onDown?: () => void,
    onLeft?: () => void,
    onRight?: () => void
  ) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        onUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onRight?.();
        break;
    }
  }, []);

  return {
    handleKeyPress,
    handleArrowNavigation,
  };
};

// High contrast mode detection and styling
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const updateContrast = () => {
      setIsHighContrast(contrastQuery.matches);
    };

    updateContrast();
    contrastQuery.addEventListener('change', updateContrast);

    return () => {
      contrastQuery.removeEventListener('change', updateContrast);
    };
  }, []);

  return isHighContrast;
};

// Reduced motion utilities
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateMotion = () => {
      setPrefersReducedMotion(motionQuery.matches);
    };

    updateMotion();
    motionQuery.addEventListener('change', updateMotion);

    return () => {
      motionQuery.removeEventListener('change', updateMotion);
    };
  }, []);

  return prefersReducedMotion;
};

// Skip link utilities for better navigation
export const createSkipLink = (targetId: string, label: string) => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 1000;
    border-radius: 4px;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  return skipLink;
};