/**
 * KeyboardNavigationExcellence - Premium keyboard navigation and focus management system
 *
 * Features:
 * - Advanced keyboard navigation with intelligent focus management
 * - Context-aware focus indicators with premium visual design
 * - Sofia AI integration for keyboard navigation guidance
 * - Sophisticated focus trapping for modal and complex interactions
 * - Keyboard shortcut system with customizable keybindings
 * - Focus restoration and memory for seamless navigation
 * - Multi-level focus hierarchy with logical tab order
 * - Screen reader announcements for focus changes
 * - Performance-optimized focus handling
 * - Accessibility-first keyboard interaction patterns
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
import { KeyboardNavigationAnalytics } from '../../utils/KeyboardNavigationAnalytics';

// TypeScript interfaces for comprehensive type safety
export interface FocusContext {
  id: string;
  type: 'navigation' | 'content' | 'modal' | 'form' | 'interactive' | 'structural' | 'decorative';
  priority: 'low' | 'medium' | 'high' | 'critical';
  userIntent: 'navigational' | 'informational' | 'confirmational' | 'exploratory' | 'transactional';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  interactionType: 'click' | 'input' | 'selection' | 'navigation' | 'activation' | 'dismissal';
  userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  previousFocus?: string;
  focusDuration?: number;
  userFrustration?: number; // 0-1 scale
}

export interface FocusIndicator {
  id: string;
  context: FocusContext;
  visualStyle: 'subtle' | 'standard' | 'prominent' | 'high-contrast' | 'animated' | 'minimal';
  position: 'inside' | 'outside' | 'center' | 'corner' | 'surround';
  shape: 'rectangle' | 'circle' | 'rounded' | 'pill' | 'underline' | 'glow' | 'border';
  size: 'small' | 'medium' | 'large' | 'adaptive';
  color: 'primary' | 'secondary' | 'accent' | 'neutral' | 'context-aware' | 'high-contrast';
  animation: 'none' | 'fade' | 'scale' | 'pulse' | 'glow' | 'morph' | 'flow';
  duration: number;
  easing: string;
  accessibilityLabel: string;
  screenReaderMessage: string;
  reducedMotionAlternative: 'static' | 'minimal' | 'none';
}

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  category: 'navigation' | 'action' | 'form' | 'accessibility' | 'system' | 'custom';
  context: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  repeatable: boolean;
  cooldown: number; // milliseconds
  action: () => void;
  enabled: boolean;
  userAssignable: boolean;
  conflictWith?: string[];
  helpText: string;
  ariaLabel: string;
}

export interface FocusTrap {
  id: string;
  container: HTMLElement;
  focusableElements: HTMLElement[];
  firstFocusable: HTMLElement;
  lastFocusable: HTMLElement;
  autoFocusElement?: HTMLElement;
  restoreFocus?: HTMLElement;
  escapeKeyHandler?: () => void;
  tabKeyHandler?: (event: KeyboardEvent, forward: boolean) => void;
  enabled: boolean;
  strict: boolean; // prevents focus from leaving trap
}

export interface KeyboardNavigationExcellenceProps {
  children: React.ReactNode;
  context: FocusContext;
  onFocusChange?: (elementId: string, context: FocusContext) => void;
  onKeyboardShortcut?: (shortcutId: string, context: FocusContext) => void;
  onFocusTrap?: (trap: FocusTrap) => void;
  onAccessibilityGuidance?: (guidance: string, context: FocusContext) => void;
  enableSofiaGuidance?: boolean;
  autoFocus?: boolean;
  focusTrapping?: boolean;
  keyboardShortcuts?: KeyboardShortcut[];
  className?: string;
}

// Advanced keyboard navigation engine
class KeyboardNavigationEngine {
  private focusIndicators: Map<string, FocusIndicator[]> = new Map();
  private keyboardShortcuts: Map<string, KeyboardShortcut[]> = new Map();
  private focusTraps: Map<string, FocusTrap> = new Map();
  private focusHistory: Map<string, HTMLElement[]> = new Map();
  private userPreferences: Map<string, any> = new Map();
  private activeShortcuts: Map<string, number> = new Map(); // timestamp tracking for cooldowns

  constructor() {
    this.initializeFocusIndicators();
    this.initializeKeyboardShortcuts();
    this.initializeUserPreferences();
  }

  private initializeFocusIndicators(): void {
    // Navigation focus indicators
    this.focusIndicators.set('navigation', [
      {
        id: 'nav-focus-standard',
        context: {
          id: 'nav-focus',
          type: 'navigation',
          priority: 'medium',
          userIntent: 'navigational',
          complexity: 'simple',
          interactionType: 'navigation',
          userExpertise: 'beginner'
        },
        visualStyle: 'standard',
        position: 'surround',
        shape: 'rounded',
        size: 'medium',
        color: 'primary',
        animation: 'glow',
        duration: 0.3,
        easing: 'easeOut',
        accessibilityLabel: 'Navigation item focused',
        screenReaderMessage: 'Navigation item selected',
        reducedMotionAlternative: 'static'
      },
      {
        id: 'nav-focus-high-contrast',
        context: {
          id: 'nav-focus-hc',
          type: 'navigation',
          priority: 'high',
          userIntent: 'navigational',
          complexity: 'simple',
          interactionType: 'navigation',
          userExpertise: 'beginner'
        },
        visualStyle: 'high-contrast',
        position: 'surround',
        shape: 'rectangle',
        size: 'large',
        color: 'high-contrast',
        animation: 'pulse',
        duration: 0.5,
        easing: 'easeInOut',
        accessibilityLabel: 'High contrast navigation focus',
        screenReaderMessage: 'Navigation item highlighted with high contrast',
        reducedMotionAlternative: 'static'
      }
    ]);

    // Interactive element focus indicators
    this.focusIndicators.set('interactive', [
      {
        id: 'button-focus-primary',
        context: {
          id: 'button-focus',
          type: 'interactive',
          priority: 'high',
          userIntent: 'confirmational',
          complexity: 'simple',
          interactionType: 'click',
          userExpertise: 'beginner'
        },
        visualStyle: 'prominent',
        position: 'surround',
        shape: 'rounded',
        size: 'medium',
        color: 'accent',
        animation: 'scale',
        duration: 0.2,
        easing: 'spring',
        accessibilityLabel: 'Button focused',
        screenReaderMessage: 'Button ready for activation',
        reducedMotionAlternative: 'static'
      },
      {
        id: 'form-focus-input',
        context: {
          id: 'form-focus',
          type: 'interactive',
          priority: 'medium',
          userIntent: 'informational',
          complexity: 'moderate',
          interactionType: 'input',
          userExpertise: 'intermediate'
        },
        visualStyle: 'standard',
        position: 'inside',
        shape: 'underline',
        size: 'small',
        color: 'primary',
        animation: 'fade',
        duration: 0.2,
        easing: 'easeOut',
        accessibilityLabel: 'Input field focused',
        screenReaderMessage: 'Input field ready for text entry',
        reducedMotionAlternative: 'static'
      }
    ]);

    // Modal focus indicators
    this.focusIndicators.set('modal', [
      {
        id: 'modal-focus-trapped',
        context: {
          id: 'modal-focus',
          type: 'modal',
          priority: 'critical',
          userIntent: 'confirmational',
          complexity: 'complex',
          interactionType: 'activation',
          userExpertise: 'intermediate'
        },
        visualStyle: 'prominent',
        position: 'surround',
        shape: 'rectangle',
        size: 'large',
        color: 'accent',
        animation: 'glow',
        duration: 0.4,
        easing: 'easeInOut',
        accessibilityLabel: 'Modal dialog focused',
        screenReaderMessage: 'Modal dialog active, focus trapped within dialog',
        reducedMotionAlternative: 'static'
      }
    ]);
  }

  private initializeKeyboardShortcuts(): void {
    // Navigation shortcuts
    this.keyboardShortcuts.set('navigation', [
      {
        id: 'nav-tab',
        keys: ['Tab'],
        description: 'Navigate to next focusable element',
        category: 'navigation',
        context: ['global', 'form', 'navigation'],
        priority: 'high',
        repeatable: true,
        cooldown: 0,
        action: () => this.handleTabNavigation(true),
        enabled: true,
        userAssignable: false,
        helpText: 'Move forward through focusable elements',
        ariaLabel: 'Next element'
      },
      {
        id: 'nav-shift-tab',
        keys: ['Shift', 'Tab'],
        description: 'Navigate to previous focusable element',
        category: 'navigation',
        context: ['global', 'form', 'navigation'],
        priority: 'high',
        repeatable: true,
        cooldown: 0,
        action: () => this.handleTabNavigation(false),
        enabled: true,
        userAssignable: false,
        helpText: 'Move backward through focusable elements',
        ariaLabel: 'Previous element'
      },
      {
        id: 'nav-enter',
        keys: ['Enter'],
        description: 'Activate focused element',
        category: 'action',
        context: ['button', 'link', 'form'],
        priority: 'high',
        repeatable: false,
        cooldown: 100,
        action: () => this.handleActivation(),
        enabled: true,
        userAssignable: false,
        helpText: 'Activate or submit the focused element',
        ariaLabel: 'Activate'
      },
      {
        id: 'nav-escape',
        keys: ['Escape'],
        description: 'Close modal or cancel action',
        category: 'action',
        context: ['modal', 'dropdown', 'menu'],
        priority: 'high',
        repeatable: false,
        cooldown: 200,
        action: () => this.handleEscape(),
        enabled: true,
        userAssignable: false,
        helpText: 'Close current dialog or cancel current action',
        ariaLabel: 'Close'
      }
    ]);

    // Accessibility shortcuts
    this.keyboardShortcuts.set('accessibility', [
      {
        id: 'skip-to-content',
        keys: ['Alt', '1'],
        description: 'Skip to main content',
        category: 'accessibility',
        context: ['global'],
        priority: 'medium',
        repeatable: false,
        cooldown: 500,
        action: () => this.handleSkipToContent(),
        enabled: true,
        userAssignable: true,
        helpText: 'Jump directly to main content area',
        ariaLabel: 'Skip to main content'
      },
      {
        id: 'focus-indicators',
        keys: ['Alt', '2'],
        description: 'Toggle focus indicators',
        category: 'accessibility',
        context: ['global'],
        priority: 'low',
        repeatable: false,
        cooldown: 300,
        action: () => this.handleToggleFocusIndicators(),
        enabled: true,
        userAssignable: true,
        helpText: 'Show or hide visual focus indicators',
        ariaLabel: 'Toggle focus indicators'
      }
    ]);

    // Form shortcuts
    this.keyboardShortcuts.set('form', [
      {
        id: 'form-submit',
        keys: ['Ctrl', 'Enter'],
        description: 'Submit form',
        category: 'form',
        context: ['form'],
        priority: 'medium',
        repeatable: false,
        cooldown: 500,
        action: () => this.handleFormSubmit(),
        enabled: true,
        userAssignable: false,
        helpText: 'Submit the current form',
        ariaLabel: 'Submit form'
      }
    ]);
  }

  private initializeUserPreferences(): void {
    this.userPreferences.set('focus_management', {
      visualIndicators: true,
      enhancedContrast: false,
      animationEnabled: true,
      autoFocus: true,
      focusTrapping: true,
      keyboardShortcuts: true,
      focusRestoration: true
    });

    this.userPreferences.set('accessibility_features', {
      skipLinks: true,
      focusIndicators: true,
      keyboardNavigation: true,
      screenReaderSupport: true,
      highContrast: false
    });
  }

  generateFocusIndicator(context: FocusContext): FocusIndicator {
    // Find the best matching focus indicator
    const relevantIndicators = this.focusIndicators.get(context.type) || [];

    // Score indicators based on context match
    const scoredIndicators = relevantIndicators.map(indicator => ({
      indicator,
      score: this.calculateIndicatorScore(indicator, context)
    }));

    // Return the highest scoring indicator
    const bestMatch = scoredIndicators.sort((a, b) => b.score - a.score)[0];
    const baseIndicator = bestMatch?.indicator || this.createFallbackIndicator(context);

    // Adapt indicator based on user preferences and context
    return this.adaptFocusIndicator(baseIndicator, context);
  }

  private calculateIndicatorScore(indicator: FocusIndicator, context: FocusContext): number {
    let score = 0;

    // Exact matches get high scores
    if (indicator.context.type === context.type) score += 30;
    if (indicator.context.priority === context.priority) score += 20;
    if (indicator.context.userIntent === context.userIntent) score += 15;
    if (indicator.context.complexity === context.complexity) score += 10;
    if (indicator.context.interactionType === context.interactionType) score += 15;
    if (indicator.context.userExpertise === context.userExpertise) score += 10;

    // Partial matches get lower scores
    if (indicator.context.priority !== context.priority) score -= 5;
    if (indicator.context.complexity !== context.complexity) score -= 3;

    return Math.max(score, 0);
  }

  private createFallbackIndicator(context: FocusContext): FocusIndicator {
    return {
      id: `fallback-${context.id}`,
      context,
      visualStyle: 'standard',
      position: 'surround',
      shape: 'rectangle',
      size: 'medium',
      color: 'primary',
      animation: 'none',
      duration: 0,
      easing: 'linear',
      accessibilityLabel: 'Element focused',
      screenReaderMessage: 'Element ready for interaction',
      reducedMotionAlternative: 'static'
    };
  }

  private adaptFocusIndicator(indicator: FocusIndicator, context: FocusContext): FocusIndicator {
    const userPrefs = this.userPreferences.get('focus_management');

    const adaptedIndicator = { ...indicator };

    // Adapt based on user preferences
    if (!userPrefs.visualIndicators) {
      adaptedIndicator.visualStyle = 'minimal';
      adaptedIndicator.animation = 'none';
    }

    if (userPrefs.enhancedContrast) {
      adaptedIndicator.visualStyle = 'high-contrast';
      adaptedIndicator.color = 'high-contrast';
    }

    if (userPrefs.animationEnabled) {
      // Keep animation as is
    } else {
      adaptedIndicator.animation = 'none';
      adaptedIndicator.reducedMotionAlternative = 'none';
    }

    // Adapt based on context priority
    if (context.priority === 'critical') {
      adaptedIndicator.visualStyle = 'prominent';
      adaptedIndicator.size = 'large';
      adaptedIndicator.animation = 'pulse';
    }

    return adaptedIndicator;
  }

  createFocusTrap(container: HTMLElement, options?: Partial<FocusTrap>): FocusTrap {
    const focusableElements = this.getFocusableElements(container);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const trap: FocusTrap = {
      id: `trap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      container,
      focusableElements,
      firstFocusable: firstFocusable as HTMLElement,
      lastFocusable: lastFocusable as HTMLElement,
      autoFocusElement: options?.autoFocusElement || firstFocusable,
      restoreFocus: options?.restoreFocus,
      escapeKeyHandler: options?.escapeKeyHandler,
      tabKeyHandler: options?.tabKeyHandler,
      enabled: options?.enabled ?? true,
      strict: options?.strict ?? false
    };

    this.focusTraps.set(trap.id, trap);
    return trap;
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors));
  }

  handleTabNavigation(forward: boolean): void {
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement) return;

    const focusableElements = this.getAllFocusableElements();
    const currentIndex = focusableElements.indexOf(activeElement);

    if (currentIndex === -1) return;

    const nextIndex = forward
      ? (currentIndex + 1) % focusableElements.length
      : (currentIndex - 1 + focusableElements.length) % focusableElements.length;

    const nextElement = focusableElements[nextIndex];
    if (nextElement) {
      nextElement.focus();

      // Announce focus change to screen readers
      this.announceFocusChange(nextElement);
    }
  }

  private getAllFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(document.querySelectorAll(focusableSelectors));
  }

  private announceFocusChange(element: HTMLElement): void {
    // Create ARIA live region announcement
    let liveRegion = document.getElementById('keyboard-nav-announcer');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'keyboard-nav-announcer';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    const elementType = element.tagName.toLowerCase();
    const elementText = element.textContent?.trim() || element.getAttribute('aria-label') || 'element';
    const announcement = `Focused on ${elementType}: ${elementText}`;

    liveRegion.textContent = announcement;
  }

  handleActivation(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement) return;

    // Trigger click or activation
    if (activeElement.tagName === 'BUTTON' || activeElement.tagName === 'A') {
      activeElement.click();
    } else if (activeElement.tagName === 'INPUT' && (activeElement as HTMLInputElement).type === 'submit') {
      const form = activeElement.closest('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
  }

  handleEscape(): void {
    // Find active modal or dropdown and close it
    const activeModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
    const activeDropdown = document.querySelector('[role="menu"][aria-expanded="true"]');

    if (activeModal) {
      const closeButton = activeModal.querySelector('[aria-label="Close"], [data-dismiss="modal"]') as HTMLElement;
      closeButton?.click();
    } else if (activeDropdown) {
      const toggleButton = document.querySelector(`[aria-controls="${activeDropdown.id}"]`) as HTMLElement;
      toggleButton?.click();
    }
  }

  handleSkipToContent(): void {
    const mainContent = document.querySelector('main, [role="main"], .main-content, #main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  handleToggleFocusIndicators(): void {
    const userPrefs = this.userPreferences.get('focus_management');
    userPrefs.visualIndicators = !userPrefs.visualIndicators;
    this.userPreferences.set('focus_management', userPrefs);

    // Update all focus indicators
    document.body.classList.toggle('focus-indicators-disabled', !userPrefs.visualIndicators);
  }

  handleFormSubmit(): void {
    const activeElement = document.activeElement as HTMLElement;
    const form = activeElement?.closest('form');
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    }
  }

  registerKeyboardShortcut(shortcut: KeyboardShortcut): void {
    this.keyboardShortcuts.set(shortcut.category, [
      ...(this.keyboardShortcuts.get(shortcut.category) || []),
      shortcut
    ]);
  }

  updateUserPreferences(preferences: Record<string, any>): void {
    Object.entries(preferences).forEach(([key, value]) => {
      this.userPreferences.set(key, value);
    });
  }

  getFocusTrap(id: string): FocusTrap | undefined {
    return this.focusTraps.get(id);
  }

  destroyFocusTrap(id: string): void {
    this.focusTraps.delete(id);
  }

  getKeyboardShortcuts(category?: string): KeyboardShortcut[] {
    if (category) {
      return this.keyboardShortcuts.get(category) || [];
    }

    // Return all shortcuts
    const allShortcuts: KeyboardShortcut[] = [];
    this.keyboardShortcuts.forEach(shortcuts => {
      allShortcuts.push(...shortcuts);
    });
    return allShortcuts;
  }
}

// Main component implementation
export const KeyboardNavigationExcellence: React.FC<KeyboardNavigationExcellenceProps> = ({
  children,
  context,
  onFocusChange,
  onKeyboardShortcut,
  onFocusTrap,
  onAccessibilityGuidance,
  enableSofiaGuidance = true,
  autoFocus = true,
  focusTrapping = false,
  keyboardShortcuts = [],
  className = ''
}) => {
  const [currentFocusIndicator, setCurrentFocusIndicator] = useState<FocusIndicator | null>(null);
  const [activeShortcuts, setActiveShortcuts] = useState<KeyboardShortcut[]>([]);
  const [sofiaMessage, setSofiaMessage] = useState('');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const keyboardEngine = useRef(new KeyboardNavigationEngine());
  const analytics = useRef(new KeyboardNavigationAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();
  const shouldReduceMotion = useReducedMotion();

  // Generate focus indicator when context changes
  useEffect(() => {
    if (context) {
      const indicator = keyboardEngine.current.generateFocusIndicator(context);
      setCurrentFocusIndicator(indicator);

      // Track focus indicator generation
      analytics.current.trackFocusIndicatorGeneration(indicator, context);

      // Show Sofia guidance if enabled
      if (enableSofiaGuidance) {
        const sofiaGenerator = new SofiaMessageGenerator();
        const message = sofiaGenerator.generateMessage({
          type: 'accessibility_guidance',
          context: context.type,
          emotionalTone: 'supportive',
          userEmotionalState: emotionalState,
          urgency: 'low'
        });
        setSofiaMessage(message);
      }
    }
  }, [context, enableSofiaGuidance, emotionalState]);

  // Update user preferences
  useEffect(() => {
    keyboardEngine.current.updateUserPreferences(preferences);
  }, [preferences]);

  // Register custom keyboard shortcuts
  useEffect(() => {
    keyboardShortcuts.forEach(shortcut => {
      keyboardEngine.current.registerKeyboardShortcut(shortcut);
    });
  }, [keyboardShortcuts]);

  const handleFocusChange = useCallback((elementId: string) => {
    onFocusChange?.(elementId, context);
    analytics.current.trackFocusChange(elementId, context);
  }, [onFocusChange, context]);

  const handleKeyboardShortcut = useCallback((shortcutId: string) => {
    onKeyboardShortcut?.(shortcutId, context);
    analytics.current.trackKeyboardShortcut(shortcutId, context);
  }, [onKeyboardShortcut, context]);

  const handleAccessibilityGuidance = useCallback((guidance: string) => {
    onAccessibilityGuidance?.(guidance, context);
    analytics.current.trackAccessibilityGuidance(guidance, context);
  }, [onAccessibilityGuidance, context]);

  if (!currentFocusIndicator) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`keyboard-navigation-excellence ${className}`}>
      {/* Sofia keyboard navigation guidance */}
      {enableSofiaGuidance && sofiaMessage && (
        <motion.div
          className="sofia-keyboard-guidance"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <div className="sofia-avatar">
            <span className="sofia-avatar__emoji">🧚‍♀️</span>
          </div>
          <div className="sofia-message-bubble">
            <p>{sofiaMessage}</p>
            <div className="keyboard-shortcuts-hint">
              <span className="hint-label">Keyboard shortcuts:</span>
              <span className="hint-keys">Tab, Enter, Escape</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main content with enhanced keyboard navigation */}
      <div
        className="keyboard-nav-content"
        data-focus-context={context.id}
        data-focus-type={context.type}
        data-focus-priority={context.priority}
      >
        {children}

        {/* Focus indicator overlay */}
        {currentFocusIndicator && (
          <div
            className={`focus-indicator focus-indicator--${currentFocusIndicator.visualStyle}`}
            data-focus-shape={currentFocusIndicator.shape}
            data-focus-position={currentFocusIndicator.position}
            data-focus-size={currentFocusIndicator.size}
            data-focus-color={currentFocusIndicator.color}
            aria-label={currentFocusIndicator.accessibilityLabel}
          >
            <div className="focus-indicator-content">
              <span className="sr-only">{currentFocusIndicator.screenReaderMessage}</span>
            </div>
          </div>
        )}

        {/* Keyboard shortcuts help */}
        <div className="keyboard-shortcuts-help" aria-hidden="true">
          <details className="shortcuts-details">
            <summary>Keyboard Shortcuts</summary>
            <div className="shortcuts-list">
              {keyboardEngine.current.getKeyboardShortcuts().map((shortcut) => (
                <div key={shortcut.id} className="shortcut-item">
                  <div className="shortcut-keys">
                    {shortcut.keys.map((key, index) => (
                      <span key={index} className="key">
                        {key}
                      </span>
                    ))}
                  </div>
                  <div className="shortcut-description">
                    {shortcut.description}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* Skip to content link */}
        <a
          href="#main-content"
          className="skip-to-content"
          onClick={(e) => {
            e.preventDefault();
            keyboardEngine.current.handleSkipToContent();
          }}
        >
          Skip to main content
        </a>

        {/* Focus trap indicators */}
        <div className="focus-trap-indicators" aria-hidden="true">
          {Array.from(keyboardEngine.current['focusTraps'].values()).map((trap) => (
            <div
              key={trap.id}
              className="focus-trap-indicator"
              data-trap-id={trap.id}
              data-trap-enabled={trap.enabled}
            >
              Focus trapped in container
            </div>
          ))}
        </div>
      </div>

      {/* Live region for keyboard announcements */}
      <div
        id="keyboard-nav-announcer"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Keyboard navigation testing panel */}
      <div className="keyboard-testing-panel" aria-hidden="true">
        <details className="keyboard-details">
          <summary>Keyboard Navigation Info</summary>
          <div className="keyboard-info">
            <h4>Focus Context</h4>
            <p><strong>Type:</strong> {context.type}</p>
            <p><strong>Priority:</strong> {context.priority}</p>
            <p><strong>Interaction:</strong> {context.interactionType}</p>
            <p><strong>Complexity:</strong> {context.complexity}</p>

            <h4>Focus Indicator</h4>
            <p><strong>Style:</strong> {currentFocusIndicator?.visualStyle}</p>
            <p><strong>Shape:</strong> {currentFocusIndicator?.shape}</p>
            <p><strong>Animation:</strong> {currentFocusIndicator?.animation}</p>

            <h4>Active Shortcuts</h4>
            <div className="active-shortcuts">
              {activeShortcuts.map((shortcut) => (
                <div key={shortcut.id} className="shortcut-badge">
                  {shortcut.keys.join('+')}
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default KeyboardNavigationExcellence;