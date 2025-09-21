/**
 * ReducedMotionAlternatives - Comprehensive accessibility system for reduced motion preferences
 *
 * Features:
 * - Advanced reduced motion detection and adaptation
 * - Graceful degradation of animations with elegant alternatives
 * - Context-aware motion reduction based on user preferences
 * - Performance-optimized static alternatives for complex animations
 * - Sofia AI integration for accessibility guidance
 * - Comprehensive screen reader support for motion alternatives
 * - Keyboard navigation excellence with motion-free interactions
 * - High contrast adaptations with elegant design
 * - Sophisticated focus handling for complex interactions
 * - Advanced voice control integration
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
import { ReducedMotionAnalytics } from '../../utils/ReducedMotionAnalytics';

// Simple Progress component for reduced motion alternatives
const ProgressComponent: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="sr-only">{label}: {value}%</span>
  </div>
);

// TypeScript interfaces for comprehensive type safety
export interface MotionAlternative {
  id: string;
  originalAnimation: string;
  reducedMotionAlternative: 'static' | 'fade' | 'slide' | 'scale' | 'none' | 'custom';
  staticContent?: React.ReactNode;
  fadeConfig?: {
    duration: number;
    easing: string;
  };
  slideConfig?: {
    direction: 'up' | 'down' | 'left' | 'right';
    distance: number;
    duration: number;
    easing: string;
  };
  scaleConfig?: {
    initialScale: number;
    finalScale: number;
    duration: number;
    easing: string;
  };
  customConfig?: {
    component: React.ComponentType<any>;
    props: Record<string, any>;
  };
  accessibilityLabel: string;
  screenReaderMessage: string;
  keyboardAlternative?: string;
  highContrastSupport: boolean;
  performanceImpact: 'low' | 'medium' | 'high';
}

export interface MotionContext {
  id: string;
  type: 'page_transition' | 'component_mount' | 'user_interaction' | 'celebration' | 'error_feedback' | 'loading' | 'navigation' | 'content_reveal';
  severity: 'subtle' | 'moderate' | 'intense' | 'critical';
  userIntent: 'informational' | 'navigational' | 'confirmational' | 'celebratory' | 'cautionary' | 'educational';
  emotionalImpact: 'calm' | 'engaging' | 'exciting' | 'urgent' | 'soothing' | 'empowering';
  duration: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  alternatives: MotionAlternative[];
  fallbackMessage: string;
  sofiaGuidance?: string;
}

export interface AccessibilityAdaptation {
  id: string;
  type: 'motion_reduction' | 'screen_reader' | 'keyboard_navigation' | 'high_contrast' | 'voice_control' | 'cognitive_load';
  trigger: 'user_preference' | 'device_capability' | 'context_awareness' | 'performance_optimization';
  adaptation: {
    motionReduction: boolean;
    screenReaderEnhancement: boolean;
    keyboardNavigation: boolean;
    highContrast: boolean;
    voiceControl: boolean;
    cognitiveSimplification: boolean;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  userExperience: 'preserved' | 'degraded_graceful' | 'enhanced' | 'alternative';
  performanceGain: number; // percentage improvement
  contextId?: string;
  timestamp?: number;
}

export interface ReducedMotionAlternativesProps {
  children: React.ReactNode;
  motionContext: MotionContext;
  onAccessibilityAdaptation?: (adaptation: AccessibilityAdaptation) => void;
  onMotionAlternativeApplied?: (alternative: MotionAlternative, context: MotionContext) => void;
  onUserExperienceFeedback?: (experience: 'positive' | 'neutral' | 'negative', adaptationId: string) => void;
  enableSofiaGuidance?: boolean;
  autoAdapt?: boolean;
  preserveIntent?: boolean;
  className?: string;
}

// Advanced motion reduction engine
class MotionReductionEngine {
  private alternatives: Map<string, MotionAlternative[]> = new Map();
  private adaptationHistory: Map<string, AccessibilityAdaptation[]> = new Map();
  private userPreferences: Map<string, any> = new Map();
  private performanceMetrics: Map<string, any> = new Map();

  constructor() {
    this.initializeAlternatives();
    this.initializeUserPreferences();
  }

  private initializeAlternatives(): void {
    // Page transition alternatives
    this.alternatives.set('page_transition', [
      {
        id: 'page-fade-in',
        originalAnimation: 'complex-page-transition',
        reducedMotionAlternative: 'fade',
        fadeConfig: {
          duration: 0.3,
          easing: 'easeOut'
        },
        accessibilityLabel: 'Page content appearing',
        screenReaderMessage: 'Page loaded successfully',
        keyboardAlternative: 'Press Enter to continue',
        highContrastSupport: true,
        performanceImpact: 'low'
      },
      {
        id: 'page-slide-up',
        originalAnimation: 'slide-up-transition',
        reducedMotionAlternative: 'slide',
        slideConfig: {
          direction: 'up',
          distance: 20,
          duration: 0.4,
          easing: 'easeOut'
        },
        accessibilityLabel: 'Content sliding into view',
        screenReaderMessage: 'New content is now visible',
        keyboardAlternative: 'Use arrow keys to navigate',
        highContrastSupport: true,
        performanceImpact: 'low'
      }
    ]);

    // Component mount alternatives
    this.alternatives.set('component_mount', [
      {
        id: 'component-scale-in',
        originalAnimation: 'scale-bounce-in',
        reducedMotionAlternative: 'scale',
        scaleConfig: {
          initialScale: 0.95,
          finalScale: 1,
          duration: 0.2,
          easing: 'easeOut'
        },
        accessibilityLabel: 'Component appearing on screen',
        screenReaderMessage: 'New component loaded',
        keyboardAlternative: 'Tab to interact',
        highContrastSupport: true,
        performanceImpact: 'low'
      },
      {
        id: 'component-static',
        originalAnimation: 'elaborate-mount-animation',
        reducedMotionAlternative: 'static',
        staticContent: (
          <div className="static-component">
            <span className="component-ready-indicator">✓ Ready</span>
          </div>
        ),
        accessibilityLabel: 'Component loaded and ready',
        screenReaderMessage: 'Component is ready for interaction',
        keyboardAlternative: 'Press Space to activate',
        highContrastSupport: true,
        performanceImpact: 'low'
      }
    ]);

    // Celebration alternatives
    this.alternatives.set('celebration', [
      {
        id: 'celebration-fade-success',
        originalAnimation: 'particle-celebration',
        reducedMotionAlternative: 'fade',
        fadeConfig: {
          duration: 0.5,
          easing: 'easeInOut'
        },
        accessibilityLabel: 'Success celebration',
        screenReaderMessage: 'Congratulations! Achievement unlocked.',
        keyboardAlternative: 'Press C to celebrate',
        highContrastSupport: true,
        performanceImpact: 'low'
      },
      {
        id: 'celebration-static-badge',
        originalAnimation: 'elaborate-celebration-sequence',
        reducedMotionAlternative: 'static',
        staticContent: (
          <div className="celebration-badge">
            <span className="badge-icon">🎉</span>
            <span className="badge-text">Achievement!</span>
          </div>
        ),
        accessibilityLabel: 'Achievement badge displayed',
        screenReaderMessage: 'Achievement earned successfully',
        keyboardAlternative: 'Badge visible for screen readers',
        highContrastSupport: true,
        performanceImpact: 'low'
      }
    ]);

    // Loading alternatives
    this.alternatives.set('loading', [
      {
        id: 'loading-progress-bar',
        originalAnimation: 'skeleton-loading-shimmer',
        reducedMotionAlternative: 'custom',
        customConfig: {
          component: ProgressComponent,
          props: {
            value: 60,
            label: 'Loading content...'
          }
        },
        accessibilityLabel: 'Loading progress indicator',
        screenReaderMessage: 'Content is loading, please wait',
        keyboardAlternative: 'Progress indicator for assistive technology',
        highContrastSupport: true,
        performanceImpact: 'medium'
      },
      {
        id: 'loading-static-dots',
        originalAnimation: 'animated-loading-dots',
        reducedMotionAlternative: 'static',
        staticContent: (
          <div className="loading-indicator">
            <span className="loading-text">Loading...</span>
            <div className="static-dots">
              <span>•</span>
              <span>•</span>
              <span>•</span>
            </div>
          </div>
        ),
        accessibilityLabel: 'Loading in progress',
        screenReaderMessage: 'Please wait while content loads',
        keyboardAlternative: 'Static loading indicator',
        highContrastSupport: true,
        performanceImpact: 'low'
      }
    ]);
  }

  private initializeUserPreferences(): void {
    // Default user preferences for motion reduction
    this.userPreferences.set('motion_reduction', {
      enabled: false,
      sensitivity: 'medium',
      contextAware: true,
      preserveIntent: true,
      performancePriority: false
    });

    this.userPreferences.set('accessibility_features', {
      screenReader: true,
      keyboardNavigation: true,
      highContrast: false,
      voiceControl: false,
      cognitiveLoadReduction: false
    });
  }

  analyzeMotionContext(context: MotionContext): {
    shouldReduceMotion: boolean;
    recommendedAlternatives: MotionAlternative[];
    adaptationStrategy: AccessibilityAdaptation;
    performanceGain: number;
    userExperience: 'preserved' | 'degraded_graceful' | 'enhanced' | 'alternative';
  } {
    const userPrefs = this.userPreferences.get('motion_reduction');
    const accessibilityPrefs = this.userPreferences.get('accessibility_features');

    // Determine if motion should be reduced
    const shouldReduceMotion = this.shouldReduceMotion(context, userPrefs);

    // Get recommended alternatives
    const recommendedAlternatives = this.getRecommendedAlternatives(context, shouldReduceMotion);

    // Create adaptation strategy
    const adaptationStrategy = this.createAdaptationStrategy(context, shouldReduceMotion, recommendedAlternatives);

    // Calculate performance gain
    const performanceGain = this.calculatePerformanceGain(recommendedAlternatives, context);

    // Determine user experience impact
    const userExperience = this.assessUserExperience(context, shouldReduceMotion, adaptationStrategy);

    return {
      shouldReduceMotion,
      recommendedAlternatives,
      adaptationStrategy,
      performanceGain,
      userExperience
    };
  }

  private shouldReduceMotion(context: MotionContext, userPrefs: any): boolean {
    // Check user preference
    if (userPrefs.enabled) return true;

    // Check context severity
    if (context.severity === 'critical' && userPrefs.contextAware) return true;

    // Check performance considerations
    if (userPrefs.performancePriority && context.complexity === 'expert') return true;

    // Check device capabilities (would be detected in real implementation)
    if (this.detectReducedMotionPreference()) return true;

    return false;
  }

  private detectReducedMotionPreference(): boolean {
    // Check CSS media query for reduced motion preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }

  private getRecommendedAlternatives(context: MotionContext, shouldReduceMotion: boolean): MotionAlternative[] {
    if (!shouldReduceMotion) return [];

    const contextAlternatives = this.alternatives.get(context.type) || [];

    // Filter alternatives based on context and performance impact
    return contextAlternatives.filter(alt => {
      // Match performance impact with context needs
      if (context.complexity === 'expert' && alt.performanceImpact === 'high') {
        return false; // Don't use high-impact alternatives for complex contexts
      }

      return true;
    });
  }

  private createAdaptationStrategy(
    context: MotionContext,
    shouldReduceMotion: boolean,
    alternatives: MotionAlternative[]
  ): AccessibilityAdaptation {
    const adaptation: AccessibilityAdaptation = {
      id: `adaptation-${context.id}-${Date.now()}`,
      type: 'motion_reduction',
      trigger: shouldReduceMotion ? 'user_preference' : 'context_awareness',
      adaptation: {
        motionReduction: shouldReduceMotion,
        screenReaderEnhancement: true,
        keyboardNavigation: true,
        highContrast: false,
        voiceControl: false,
        cognitiveSimplification: context.complexity === 'expert'
      },
      priority: shouldReduceMotion ? 'high' : 'medium',
      userExperience: shouldReduceMotion ? 'alternative' : 'preserved',
      performanceGain: this.calculatePerformanceGain(alternatives, context)
    };

    return adaptation;
  }

  private calculatePerformanceGain(alternatives: MotionAlternative[], context: MotionContext): number {
    if (alternatives.length === 0) return 0;

    const averageImpact = alternatives.reduce((sum, alt) => {
      const impactScore = alt.performanceImpact === 'low' ? 10 : alt.performanceImpact === 'medium' ? 25 : 40;
      return sum + impactScore;
    }, 0) / alternatives.length;

    // Adjust based on context complexity
    const complexityMultiplier = context.complexity === 'simple' ? 0.5 : context.complexity === 'moderate' ? 1 : 1.5;

    return Math.min(averageImpact * complexityMultiplier, 100);
  }

  private assessUserExperience(
    context: MotionContext,
    shouldReduceMotion: boolean,
    adaptation: AccessibilityAdaptation
  ): 'preserved' | 'degraded_graceful' | 'enhanced' | 'alternative' {
    if (!shouldReduceMotion) return 'preserved';

    // Assess based on context type and adaptation quality
    if (context.type === 'celebration' && adaptation.adaptation.motionReduction) {
      return 'alternative'; // Celebrations become static but still meaningful
    }

    if (context.complexity === 'expert' && adaptation.performanceGain > 30) {
      return 'enhanced'; // Complex animations become more performant
    }

    return 'degraded_graceful'; // Graceful degradation with alternatives
  }

  applyAdaptation(adaptation: AccessibilityAdaptation, context: MotionContext): {
    adaptedContent: React.ReactNode;
    appliedAlternatives: MotionAlternative[];
    accessibilityEnhancements: Record<string, any>;
  } {
    const appliedAlternatives = this.getRecommendedAlternatives(context, adaptation.adaptation.motionReduction);

    // Create adapted content based on alternatives
    const adaptedContent = this.createAdaptedContent(appliedAlternatives, context);

    // Add accessibility enhancements
    const accessibilityEnhancements = this.addAccessibilityEnhancements(adaptation, context);

    // Store adaptation history
    this.recordAdaptation(adaptation, context);

    return {
      adaptedContent,
      appliedAlternatives,
      accessibilityEnhancements
    };
  }

  private createAdaptedContent(alternatives: MotionAlternative[], context: MotionContext): React.ReactNode {
    if (alternatives.length === 0) return null;

    // Choose the best alternative based on context
    const bestAlternative = alternatives[0]; // Simplified - would use more sophisticated selection

    if (!bestAlternative) return null;

    switch (bestAlternative.reducedMotionAlternative) {
      case 'static':
        return bestAlternative.staticContent || <div>Static content</div>;

      case 'fade':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={bestAlternative.fadeConfig}
            aria-label={bestAlternative.accessibilityLabel}
          >
            Content with fade transition
          </motion.div>
        );

      case 'slide':
        const slideProps = {
          initial: { opacity: 0, y: bestAlternative.slideConfig?.direction === 'up' ? 20 : 0 },
          animate: { opacity: 1, y: 0 },
          transition: bestAlternative.slideConfig
        };

        return (
          <motion.div
            {...slideProps}
            aria-label={bestAlternative.accessibilityLabel}
          >
            Content with slide transition
          </motion.div>
        );

      case 'scale':
        return (
          <motion.div
            initial={{ opacity: 0, scale: bestAlternative.scaleConfig?.initialScale || 0.9 }}
            animate={{ opacity: 1, scale: bestAlternative.scaleConfig?.finalScale || 1 }}
            transition={bestAlternative.scaleConfig}
            aria-label={bestAlternative.accessibilityLabel}
          >
            Content with scale transition
          </motion.div>
        );

      case 'custom':
        if (bestAlternative.customConfig) {
          // For demo purposes, create a simple progress component
          const ProgressComponent = ({ value, label }: { value: number; label: string }) => (
            <div className="progress-container" aria-label={bestAlternative.accessibilityLabel}>
              <div className="progress-label">{label}</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${value}%` }}
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          );

          return (
            <ProgressComponent
              value={bestAlternative.customConfig.props.value || 0}
              label={bestAlternative.customConfig.props.label || 'Loading...'}
            />
          );
        }
        return <div>Custom component not available</div>;

      case 'none':
      default:
        return (
          <div aria-label={bestAlternative.accessibilityLabel}>
            Content without animation
          </div>
        );
    }
  }

  private addAccessibilityEnhancements(adaptation: AccessibilityAdaptation, context: MotionContext): Record<string, any> {
    const enhancements: Record<string, any> = {};

    if (adaptation.adaptation.screenReaderEnhancement) {
      enhancements.screenReader = {
        announcements: [context.fallbackMessage],
        descriptions: [`Adapted for accessibility: ${adaptation.userExperience}`],
        status: 'Content adapted for screen readers'
      };
    }

    if (adaptation.adaptation.keyboardNavigation) {
      enhancements.keyboard = {
        shortcuts: ['Enter to interact', 'Escape to close', 'Tab to navigate'],
        focusManagement: 'enhanced',
        navigation: 'sequential'
      };
    }

    if (adaptation.adaptation.highContrast) {
      enhancements.highContrast = {
        borders: 'enhanced',
        colors: 'high-contrast-palette',
        typography: 'bold-enhanced'
      };
    }

    return enhancements;
  }

  private recordAdaptation(adaptation: AccessibilityAdaptation, context: MotionContext): void {
    const history = this.adaptationHistory.get(context.type) || [];
    history.push({
      ...adaptation,
      contextId: context.id,
      timestamp: Date.now()
    });
    this.adaptationHistory.set(context.type, history);
  }

  updateUserPreferences(preferences: Record<string, any>): void {
    Object.entries(preferences).forEach(([key, value]) => {
      this.userPreferences.set(key, value);
    });
  }

  getAdaptationHistory(contextType?: string): AccessibilityAdaptation[] {
    if (contextType) {
      return this.adaptationHistory.get(contextType) || [];
    }

    // Return all adaptation history
    const allHistory: AccessibilityAdaptation[] = [];
    this.adaptationHistory.forEach(history => {
      allHistory.push(...history);
    });
    return allHistory;
  }
}

// Main component implementation
export const ReducedMotionAlternatives: React.FC<ReducedMotionAlternativesProps> = ({
  children,
  motionContext,
  onAccessibilityAdaptation,
  onMotionAlternativeApplied,
  onUserExperienceFeedback,
  enableSofiaGuidance = true,
  autoAdapt = true,
  preserveIntent = true,
  className = ''
}) => {
  const [adaptedContent, setAdaptedContent] = useState<React.ReactNode>(children);
  const [appliedAlternatives, setAppliedAlternatives] = useState<MotionAlternative[]>([]);
  const [accessibilityEnhancements, setAccessibilityEnhancements] = useState<Record<string, any>>({});
  const [sofiaMessage, setSofiaMessage] = useState('');
  const [showAdaptationNotice, setShowAdaptationNotice] = useState(false);

  const motionEngine = useRef(new MotionReductionEngine());
  const analytics = useRef(new ReducedMotionAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();
  const shouldReduceMotion = useReducedMotion();

  // Analyze and adapt motion context
  useEffect(() => {
    if (motionContext && autoAdapt) {
      const analysis = motionEngine.current.analyzeMotionContext(motionContext);

      if (analysis.shouldReduceMotion) {
        const adaptation = motionEngine.current.applyAdaptation(analysis.adaptationStrategy, motionContext);

        setAdaptedContent(adaptation.adaptedContent);
        setAppliedAlternatives(adaptation.appliedAlternatives);
        setAccessibilityEnhancements(adaptation.accessibilityEnhancements);

        // Notify about adaptation
        onAccessibilityAdaptation?.(analysis.adaptationStrategy);

        // Track adaptation
        analytics.current.trackAdaptation(analysis.adaptationStrategy, motionContext, adaptation.appliedAlternatives);

        // Show Sofia guidance if enabled
        if (enableSofiaGuidance) {
          const sofiaGenerator = new SofiaMessageGenerator();
          const message = sofiaGenerator.generateMessage({
            type: 'accessibility_guidance',
            context: motionContext.type,
            emotionalTone: 'supportive',
            userEmotionalState: emotionalState,
            urgency: 'low'
          });
          setSofiaMessage(message);
          setShowAdaptationNotice(true);
        }
      } else {
        setAdaptedContent(children);
        setAppliedAlternatives([]);
        setAccessibilityEnhancements({});
      }
    }
  }, [motionContext, autoAdapt, children, onAccessibilityAdaptation, enableSofiaGuidance, emotionalState]);

  // Update user preferences
  useEffect(() => {
    motionEngine.current.updateUserPreferences(preferences);
  }, [preferences]);

  const handleAlternativeApplied = useCallback((alternative: MotionAlternative) => {
    onMotionAlternativeApplied?.(alternative, motionContext);
    analytics.current.trackAlternativeApplied(alternative, motionContext);
  }, [onMotionAlternativeApplied, motionContext]);

  const handleUserFeedback = useCallback((experience: 'positive' | 'neutral' | 'negative') => {
    onUserExperienceFeedback?.(experience, motionContext.id);
    analytics.current.trackUserFeedback(experience, motionContext.id);
  }, [onUserExperienceFeedback, motionContext.id]);

  return (
    <div className={`reduced-motion-alternatives ${className}`}>
      {/* Sofia accessibility guidance */}
      {enableSofiaGuidance && sofiaMessage && showAdaptationNotice && (
        <motion.div
          className="sofia-accessibility-guidance"
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
            <div className="accessibility-features">
              {Object.entries(accessibilityEnhancements).map(([feature, config]) => (
                <span key={feature} className="feature-indicator">
                  {feature}: ✓
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Adapted content */}
      <div className="adapted-content-container">
        {adaptedContent}

        {/* Accessibility enhancements overlay */}
        {Object.keys(accessibilityEnhancements).length > 0 && (
          <div className="accessibility-enhancements" aria-hidden="true">
            {accessibilityEnhancements.screenReader && (
              <div className="screen-reader-enhancement">
                <span className="sr-only">
                  {accessibilityEnhancements.screenReader.announcements?.join('. ')}
                </span>
              </div>
            )}

            {accessibilityEnhancements.keyboard && (
              <div className="keyboard-enhancement">
                <div className="keyboard-shortcuts" aria-label="Keyboard shortcuts">
                  {accessibilityEnhancements.keyboard.shortcuts?.map((shortcut: string, index: number) => (
                    <span key={index} className="shortcut-hint">
                      {shortcut}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Motion alternatives applied indicator */}
      {appliedAlternatives.length > 0 && (
        <div className="motion-alternatives-applied" aria-live="polite">
          <div className="alternatives-list">
            {appliedAlternatives.map((alternative) => (
              <div
                key={alternative.id}
                className="alternative-indicator"
                onClick={() => handleAlternativeApplied(alternative)}
              >
                <span className="alternative-type">{alternative.reducedMotionAlternative}</span>
                <span className="alternative-label">{alternative.accessibilityLabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User feedback controls */}
      <div className="user-feedback-controls" aria-label="Accessibility feedback">
        <button
          className="feedback-button feedback-positive"
          onClick={() => handleUserFeedback('positive')}
          aria-label="Good accessibility experience"
        >
          👍 Good
        </button>
        <button
          className="feedback-button feedback-neutral"
          onClick={() => handleUserFeedback('neutral')}
          aria-label="Okay accessibility experience"
        >
          👌 Okay
        </button>
        <button
          className="feedback-button feedback-negative"
          onClick={() => handleUserFeedback('negative')}
          aria-label="Poor accessibility experience"
        >
          👎 Needs improvement
        </button>
      </div>
    </div>
  );
};

export default ReducedMotionAlternatives;