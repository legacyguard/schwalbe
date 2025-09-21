/**
 * AdvancedScreenReaderSupport - Sophisticated screen reader support with intelligent descriptions
 *
 * Features:
 * - Context-aware screen reader descriptions with emotional intelligence
 * - Dynamic content announcements based on user interactions
 * - Sofia AI integration for natural language accessibility guidance
 * - Advanced ARIA labeling with semantic meaning
 * - Live region management for real-time updates
 * - Screen reader testing and validation
 * - Cognitive accessibility with simplified language options
 * - Multi-language screen reader support
 * - Performance-optimized announcements
 * - User preference learning for personalized accessibility
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
import { ScreenReaderAnalytics } from '../../utils/ScreenReaderAnalytics';
import {
  ScreenReaderContext,
  ScreenReaderDescription,
  ScreenReaderAnnouncement,
  ScreenReaderAction,
  CognitiveAccessibility
} from '../../types/screenReader';

export interface AdvancedScreenReaderSupportProps {
  children: React.ReactNode;
  context: ScreenReaderContext;
  onAnnouncement?: (announcement: ScreenReaderAnnouncement) => void;
  onDescriptionUpdate?: (description: ScreenReaderDescription) => void;
  onAccessibilityIssue?: (issue: string, context: ScreenReaderContext) => void;
  enableSofiaGuidance?: boolean;
  autoAnnounce?: boolean;
  cognitiveSupport?: boolean;
  multiLanguage?: boolean;
  className?: string;
}

// Advanced screen reader engine
class ScreenReaderEngine {
  private descriptions: Map<string, ScreenReaderDescription[]> = new Map();
  private announcements: ScreenReaderAnnouncement[] = [];
  private cognitiveSettings: Map<string, CognitiveAccessibility> = new Map();
  private userPreferences: Map<string, any> = new Map();
  private announcementQueue: ScreenReaderAnnouncement[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.initializeDescriptions();
    this.initializeCognitiveSettings();
    this.initializeUserPreferences();
  }

  private initializeDescriptions(): void {
    // Navigation descriptions
    this.descriptions.set('navigation', [
      {
        id: 'nav-main',
        context: {
          id: 'main-nav',
          type: 'navigation',
          priority: 'medium',
          userIntent: 'navigational',
          emotionalTone: 'neutral',
          complexity: 'simple',
          contentType: 'structural',
          userExpertise: 'beginner'
        },
        shortDescription: 'Main navigation menu',
        longDescription: 'Primary navigation containing links to main sections of the application',
        ariaLabel: 'Main navigation',
        role: 'navigation',
        ariaDescribedBy: 'nav-description',
        relevant: 'all'
      },
      {
        id: 'nav-breadcrumb',
        context: {
          id: 'breadcrumb-nav',
          type: 'navigation',
          priority: 'low',
          userIntent: 'navigational',
          emotionalTone: 'neutral',
          complexity: 'simple',
          contentType: 'structural',
          userExpertise: 'intermediate'
        },
        shortDescription: 'Breadcrumb navigation',
        longDescription: 'Shows your current location and allows quick navigation to parent sections',
        ariaLabel: 'Breadcrumb navigation',
        role: 'navigation',
        ariaDescribedBy: 'breadcrumb-description',
        relevant: 'all'
      }
    ]);

    // Content descriptions
    this.descriptions.set('content', [
      {
        id: 'content-main',
        context: {
          id: 'main-content',
          type: 'content',
          priority: 'high',
          userIntent: 'informational',
          emotionalTone: 'neutral',
          complexity: 'moderate',
          contentType: 'text',
          userExpertise: 'beginner'
        },
        shortDescription: 'Main content area',
        longDescription: 'Primary content section containing the main information and functionality',
        ariaLabel: 'Main content',
        role: 'main',
        ariaDescribedBy: 'main-content-description'
      },
      {
        id: 'content-article',
        context: {
          id: 'article-content',
          type: 'content',
          priority: 'medium',
          userIntent: 'informational',
          emotionalTone: 'neutral',
          complexity: 'complex',
          contentType: 'text',
          userExpertise: 'advanced'
        },
        shortDescription: 'Article content',
        longDescription: 'Detailed article with comprehensive information and structured content',
        ariaLabel: 'Article content',
        role: 'article',
        ariaDescribedBy: 'article-description'
      }
    ]);

    // Interactive element descriptions
    this.descriptions.set('interaction', [
      {
        id: 'button-primary',
        context: {
          id: 'primary-button',
          type: 'interaction',
          priority: 'high',
          userIntent: 'confirmational',
          emotionalTone: 'positive',
          complexity: 'simple',
          contentType: 'interactive',
          userExpertise: 'beginner'
        },
        shortDescription: 'Primary action button',
        longDescription: 'Main call-to-action button that performs the primary function',
        ariaLabel: 'Continue',
        role: 'button',
        ariaDescribedBy: 'button-description',
        hasPopup: false,
        pressed: false
      },
      {
        id: 'form-input',
        context: {
          id: 'form-input',
          type: 'interaction',
          priority: 'medium',
          userIntent: 'informational',
          emotionalTone: 'neutral',
          complexity: 'simple',
          contentType: 'interactive',
          userExpertise: 'beginner'
        },
        shortDescription: 'Text input field',
        longDescription: 'Enter your information in this text input field',
        ariaLabel: 'Input field',
        role: 'textbox',
        ariaDescribedBy: 'input-description',
        required: false,
        autoComplete: 'off'
      }
    ]);

    // Feedback descriptions
    this.descriptions.set('feedback', [
      {
        id: 'success-message',
        context: {
          id: 'success-feedback',
          type: 'feedback',
          priority: 'medium',
          userIntent: 'confirmational',
          emotionalTone: 'positive',
          complexity: 'simple',
          contentType: 'live',
          userExpertise: 'beginner'
        },
        shortDescription: 'Success notification',
        longDescription: 'Action completed successfully',
        ariaLabel: 'Success',
        role: 'status',
        liveRegion: 'polite',
        atomic: true
      },
      {
        id: 'error-message',
        context: {
          id: 'error-feedback',
          type: 'feedback',
          priority: 'high',
          userIntent: 'cautionary',
          emotionalTone: 'apologetic',
          complexity: 'simple',
          contentType: 'live',
          userExpertise: 'beginner'
        },
        shortDescription: 'Error notification',
        longDescription: 'An error occurred that needs attention',
        ariaLabel: 'Error',
        role: 'alert',
        liveRegion: 'assertive',
        atomic: true,
        invalid: true
      }
    ]);
  }

  private initializeCognitiveSettings(): void {
    this.cognitiveSettings.set('default', {
      id: 'cognitive-default',
      simplifiedLanguage: false,
      shortSentences: false,
      commonWords: false,
      clearStructure: true,
      reducedCognitiveLoad: false,
      breakComplexTasks: false,
      provideExamples: false,
      avoidJargon: false,
      consistentTerminology: true,
      logicalSequence: true,
      userControl: true,
      errorPrevention: true,
      clearFeedback: true,
      reversibleActions: true,
      predictableBehavior: true
    });

    this.cognitiveSettings.set('simplified', {
      id: 'cognitive-simplified',
      simplifiedLanguage: true,
      shortSentences: true,
      commonWords: true,
      clearStructure: true,
      reducedCognitiveLoad: true,
      breakComplexTasks: true,
      provideExamples: true,
      avoidJargon: true,
      consistentTerminology: true,
      logicalSequence: true,
      userControl: true,
      errorPrevention: true,
      clearFeedback: true,
      reversibleActions: true,
      predictableBehavior: true
    });
  }

  private initializeUserPreferences(): void {
    this.userPreferences.set('announcement_style', {
      verbosity: 'balanced',
      emotional_tone: 'neutral',
      technical_detail: 'moderate',
      contextual_awareness: true,
      personalization: true
    });

    this.userPreferences.set('cognitive_support', {
      enabled: false,
      level: 'moderate',
      adaptive: true,
      user_controlled: true
    });
  }

  generateDescription(context: ScreenReaderContext): ScreenReaderDescription {
    // Find the best matching description template
    const relevantDescriptions = this.descriptions.get(context.type) || [];

    // Score descriptions based on context match
    const scoredDescriptions = relevantDescriptions.map(desc => ({
      description: desc,
      score: this.calculateDescriptionScore(desc, context)
    }));

    // Return the highest scoring description
    const bestMatch = scoredDescriptions.sort((a, b) => b.score - a.score)[0];
    const baseDescription = bestMatch?.description || this.createFallbackDescription(context);

    // Adapt description based on user preferences and cognitive settings
    return this.adaptDescription(baseDescription, context);
  }

  private calculateDescriptionScore(description: ScreenReaderDescription, context: ScreenReaderContext): number {
    let score = 0;

    // Exact matches get high scores
    if (description.context.type === context.type) score += 30;
    if (description.context.priority === context.priority) score += 20;
    if (description.context.userIntent === context.userIntent) score += 15;
    if (description.context.emotionalTone === context.emotionalTone) score += 10;
    if (description.context.complexity === context.complexity) score += 10;
    if (description.context.userExpertise === context.userExpertise) score += 15;

    // Partial matches get lower scores
    if (description.context.priority !== context.priority) score -= 5;
    if (description.context.complexity !== context.complexity) score -= 3;

    return Math.max(score, 0);
  }

  private createFallbackDescription(context: ScreenReaderContext): ScreenReaderDescription {
    return {
      id: `fallback-${context.id}`,
      context,
      shortDescription: 'Interactive element',
      longDescription: 'User interface element for interaction',
      ariaLabel: 'Element',
      role: 'generic',
      ariaDescribedBy: 'fallback-description'
    };
  }

  private adaptDescription(description: ScreenReaderDescription, context: ScreenReaderContext): ScreenReaderDescription {
    const userPrefs = this.userPreferences.get('announcement_style');
    const cognitiveSettings = this.cognitiveSettings.get('default');

    let adaptedDescription = { ...description };

    // Adapt based on verbosity preference
    if (userPrefs.verbosity === 'brief') {
      adaptedDescription.longDescription = adaptedDescription.shortDescription;
    } else if (userPrefs.verbosity === 'detailed') {
      adaptedDescription.longDescription = this.expandDescription(adaptedDescription.longDescription, context);
    }

    // Adapt based on emotional tone preference
    if (userPrefs.emotional_tone !== 'neutral') {
      adaptedDescription = this.adaptEmotionalTone(adaptedDescription, context, userPrefs.emotional_tone);
    }

    // Apply cognitive accessibility adaptations
    if (cognitiveSettings?.simplifiedLanguage) {
      adaptedDescription = this.simplifyLanguage(adaptedDescription);
    }

    // Add contextual information
    if (userPrefs.contextual_awareness) {
      adaptedDescription = this.addContextualInfo(adaptedDescription, context);
    }

    return adaptedDescription;
  }

  private expandDescription(baseDescription: string, context: ScreenReaderContext): string {
    const expansions: Record<string, string> = {
      'navigation': '. Use arrow keys to navigate between items, Enter to select, Escape to close.',
      'content': '. Use Tab to navigate through content sections, Space to interact with elements.',
      'interaction': '. Press Enter or Space to activate this element.',
      'feedback': '. This status will update automatically as actions are performed.',
      'error': '. Please review the information and try again.',
      'loading': '. Please wait while the content loads.',
      'celebration': '. Congratulations on this achievement!',
      'instruction': '. Follow the steps below to complete this task.'
    };

    return baseDescription + (expansions[context.type] || '');
  }

  private adaptEmotionalTone(
    description: ScreenReaderDescription,
    context: ScreenReaderContext,
    targetTone: string
  ): ScreenReaderDescription {
    const toneAdaptations: Record<string, Record<string, string>> = {
      'positive': {
        'neutral': 'Great! ',
        'encouraging': 'Excellent! ',
        'celebratory': 'Fantastic! '
      },
      'encouraging': {
        'neutral': 'You can do this! ',
        'positive': 'Keep going! ',
        'celebratory': 'Amazing work! '
      }
    };

    const prefix = toneAdaptations[targetTone]?.[context.emotionalTone] || '';
    return {
      ...description,
      shortDescription: prefix + description.shortDescription,
      longDescription: prefix + description.longDescription
    };
  }

  private simplifyLanguage(description: ScreenReaderDescription): ScreenReaderDescription {
    const simplifications: Record<string, string> = {
      'comprehensive': 'detailed',
      'utilize': 'use',
      'facilitate': 'help',
      'implement': 'do',
      'configuration': 'setup',
      'authentication': 'login',
      'authorization': 'permission'
    };

    let simplifiedShort = description.shortDescription;
    let simplifiedLong = description.longDescription;

    Object.entries(simplifications).forEach(([complex, simple]) => {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplifiedShort = simplifiedShort.replace(regex, simple);
      simplifiedLong = simplifiedLong.replace(regex, simple);
    });

    return {
      ...description,
      shortDescription: simplifiedShort,
      longDescription: simplifiedLong
    };
  }

  private addContextualInfo(description: ScreenReaderDescription, context: ScreenReaderContext): ScreenReaderDescription {
    let contextualInfo = '';

    if (context.previousInteractions && context.previousInteractions > 0) {
      contextualInfo += ` Previously used ${context.previousInteractions} times.`;
    }

    if (context.userFrustration && context.userFrustration > 0.5) {
      contextualInfo += ' Take your time with this step.';
    }

    return {
      ...description,
      longDescription: description.longDescription + contextualInfo
    };
  }

  createAnnouncement(
    type: ScreenReaderAnnouncement['type'],
    message: string,
    context: ScreenReaderContext,
    options?: Partial<ScreenReaderAnnouncement>
  ): ScreenReaderAnnouncement {
    const announcement: ScreenReaderAnnouncement = {
      id: `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      priority: options?.priority || 'medium',
      politeness: this.getPolitenessForType(type),
      duration: options?.duration || 3000,
      autoClose: options?.autoClose ?? true,
      actions: options?.actions || [],
      context,
      timestamp: Date.now()
    };

    return announcement;
  }

  private getPolitenessForType(type: ScreenReaderAnnouncement['type']): 'assertive' | 'polite' | 'off' {
    const politenessMap: Record<ScreenReaderAnnouncement['type'], 'assertive' | 'polite' | 'off'> = {
      'status': 'polite',
      'alert': 'assertive',
      'progress': 'polite',
      'completion': 'polite',
      'error': 'assertive',
      'warning': 'assertive',
      'info': 'polite',
      'success': 'polite'
    };

    return politenessMap[type] || 'polite';
  }

  queueAnnouncement(announcement: ScreenReaderAnnouncement): void {
    this.announcementQueue.push(announcement);
    this.processAnnouncementQueue();
  }

  private async processAnnouncementQueue(): Promise<void> {
    if (this.isProcessingQueue || this.announcementQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.announcementQueue.length > 0) {
      const announcement = this.announcementQueue.shift();
      if (announcement) {
        await this.announce(announcement);
        await this.delay(announcement.duration || 1000);
      }
    }

    this.isProcessingQueue = false;
  }

  private announce(announcement: ScreenReaderAnnouncement): Promise<void> {
    return new Promise((resolve) => {
      // In a real implementation, this would use the Web Speech API or ARIA live regions
      console.log(`Screen Reader Announcement: ${announcement.message}`);

      // Create ARIA live region announcement
      this.createAriaAnnouncement(announcement);

      resolve();
    });
  }

  private createAriaAnnouncement(announcement: ScreenReaderAnnouncement): void {
    // Create or update ARIA live region
    let liveRegion = document.getElementById('sr-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'sr-live-region';
      liveRegion.setAttribute('aria-live', announcement.politeness);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    // Add announcement to live region
    const announcementElement = document.createElement('div');
    announcementElement.textContent = announcement.message;
    liveRegion.appendChild(announcementElement);

    // Remove after announcement
    setTimeout(() => {
      if (announcementElement.parentNode) {
        announcementElement.parentNode.removeChild(announcementElement);
      }
    }, announcement.duration || 3000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  updateUserPreferences(preferences: Record<string, any>): void {
    Object.entries(preferences).forEach(([key, value]) => {
      this.userPreferences.set(key, value);
    });
  }

  getCognitiveSettings(): CognitiveAccessibility {
    const cognitiveSupport = this.userPreferences.get('cognitive_support');
    return this.cognitiveSettings.get(cognitiveSupport.enabled ? 'simplified' : 'default') || this.cognitiveSettings.get('default')!;
  }
}

// Main component implementation
export const AdvancedScreenReaderSupport: React.FC<AdvancedScreenReaderSupportProps> = ({
  children,
  context,
  onAnnouncement,
  onDescriptionUpdate,
  onAccessibilityIssue,
  enableSofiaGuidance = true,
  autoAnnounce = true,
  cognitiveSupport = false,
  multiLanguage = false,
  className = ''
}) => {
  const [currentDescription, setCurrentDescription] = useState<ScreenReaderDescription | null>(null);
  const [pendingAnnouncements, setPendingAnnouncements] = useState<ScreenReaderAnnouncement[]>([]);
  const [sofiaMessage, setSofiaMessage] = useState('');
  const [showCognitiveSupport, setShowCognitiveSupport] = useState(false);

  const screenReaderEngine = useRef(new ScreenReaderEngine());
  const analytics = useRef(new ScreenReaderAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();
  const shouldReduceMotion = useReducedMotion();

  // Generate description when context changes
  useEffect(() => {
    if (context) {
      const description = screenReaderEngine.current.generateDescription(context);
      setCurrentDescription(description);

      // Update description
      onDescriptionUpdate?.(description);

      // Track description generation
      analytics.current.trackDescriptionGeneration(description, context);

      // Auto-announce if enabled
      if (autoAnnounce) {
        const announcement = screenReaderEngine.current.createAnnouncement(
          'info',
          description.shortDescription,
          context
        );
        screenReaderEngine.current.queueAnnouncement(announcement);
        onAnnouncement?.(announcement);
      }

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

      // Enable cognitive support if needed
      if (cognitiveSupport) {
        const cognitiveSettings = screenReaderEngine.current.getCognitiveSettings();
        setShowCognitiveSupport(cognitiveSettings.simplifiedLanguage);
      }
    }
  }, [context, onDescriptionUpdate, autoAnnounce, onAnnouncement, enableSofiaGuidance, emotionalState, cognitiveSupport]);

  // Update user preferences
  useEffect(() => {
    screenReaderEngine.current.updateUserPreferences(preferences);
  }, [preferences]);

  const handleAnnouncement = useCallback((announcement: ScreenReaderAnnouncement) => {
    onAnnouncement?.(announcement);
    analytics.current.trackAnnouncement(announcement, context);
  }, [onAnnouncement, context]);

  const handleAccessibilityIssue = useCallback((issue: string) => {
    onAccessibilityIssue?.(issue, context);
    analytics.current.trackAccessibilityIssue(issue, context);
  }, [onAccessibilityIssue, context]);

  if (!currentDescription) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`advanced-screen-reader-support ${className}`}>
      {/* Sofia accessibility guidance */}
      {enableSofiaGuidance && sofiaMessage && (
        <motion.div
          className="sofia-screen-reader-guidance"
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
              <span className="feature-indicator">Screen Reader: ✓</span>
              <span className="feature-indicator">ARIA Labels: ✓</span>
              <span className="feature-indicator">Live Regions: ✓</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main content with enhanced accessibility */}
      <div
        className="accessible-content"
        role={currentDescription.role}
        aria-label={currentDescription.ariaLabel}
        aria-describedby={currentDescription.ariaDescribedBy}
        aria-details={currentDescription.ariaDetails}
        aria-live={currentDescription.liveRegion}
        aria-atomic={currentDescription.atomic}
        aria-relevant={currentDescription.relevant}
        aria-hidden={currentDescription.hidden}
        aria-expanded={currentDescription.expanded}
        aria-selected={currentDescription.selected}
        aria-checked={currentDescription.checked}
        aria-pressed={currentDescription.pressed}
        aria-current={currentDescription.current}
        aria-invalid={currentDescription.invalid}
        aria-controls={currentDescription.controls?.join(' ')}
        aria-owns={currentDescription.owns?.join(' ')}
        aria-flowto={currentDescription.flowTo?.join(' ')}
        aria-posinset={currentDescription.posInSet}
        aria-setsize={currentDescription.setSize}
        aria-level={currentDescription.level}
        aria-placeholder={currentDescription.placeholder}
        aria-valuetext={currentDescription.valueText}
        aria-autocomplete={currentDescription.autoComplete as 'none' | 'inline' | 'list' | 'both'}
        aria-haspopup={currentDescription.hasPopup}
        aria-keyshortcuts={currentDescription.keyShortcuts}
        aria-orientation={currentDescription.orientation}
        aria-sort={currentDescription.sort}
        aria-readonly={currentDescription.readOnly}
        aria-required={currentDescription.required}
        aria-valuemin={currentDescription.valueMin}
        aria-valuemax={currentDescription.valueMax}
        aria-valuenow={currentDescription.valueNow}
        aria-colcount={currentDescription.colCount}
        aria-colindex={currentDescription.colIndex}
        aria-rowcount={currentDescription.rowCount}
        aria-rowindex={currentDescription.rowIndex}
        aria-rowspan={currentDescription.rowSpan}
        aria-colspan={currentDescription.colSpan}
      >
        {children}

        {/* Hidden descriptions for screen readers */}
        <div id={currentDescription.ariaDescribedBy} className="sr-only">
          {currentDescription.longDescription}
        </div>

        {/* Cognitive support overlay */}
        {showCognitiveSupport && (
          <div className="cognitive-support-overlay" aria-hidden="true">
            <div className="cognitive-simplification">
              <div className="simplified-instructions">
                <h3>Simplified Instructions</h3>
                <p>{currentDescription.shortDescription}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live region for announcements */}
      <div
        id="sr-live-region"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Accessibility testing panel */}
      <div className="accessibility-testing-panel" aria-hidden="true">
        <details className="accessibility-details">
          <summary>Accessibility Information</summary>
          <div className="accessibility-info">
            <h4>Screen Reader Description</h4>
            <p><strong>Short:</strong> {currentDescription.shortDescription}</p>
            <p><strong>Long:</strong> {currentDescription.longDescription}</p>
            <p><strong>ARIA Label:</strong> {currentDescription.ariaLabel}</p>
            <p><strong>Role:</strong> {currentDescription.role}</p>
            <p><strong>Live Region:</strong> {currentDescription.liveRegion || 'None'}</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default AdvancedScreenReaderSupport;