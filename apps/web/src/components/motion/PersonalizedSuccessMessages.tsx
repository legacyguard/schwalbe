/**
 * PersonalizedSuccessMessages - Advanced personalized success messaging system
 *
 * Features:
 * - Dynamic success message generation based on user preferences
 * - Context-aware celebration messaging with emotional intelligence
 * - Sofia AI integration for warm, personalized communication
 * - Achievement-specific messaging with user history awareness
 * - Cultural and language adaptation for success messages
 * - Progressive success messaging based on user journey stage
 * - Emotional tone adaptation based on user state and achievement significance
 * - Accessibility-first success communication with screen reader support
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
import { PersonalizedSuccessAnalytics } from '../../utils/PersonalizedSuccessAnalytics';

// TypeScript interfaces for comprehensive type safety
export interface UserAchievement {
  id: string;
  type: 'milestone' | 'completion' | 'improvement' | 'discovery' | 'mastery' | 'contribution' | 'breakthrough';
  category: 'document' | 'family' | 'security' | 'planning' | 'organization' | 'collaboration' | 'learning';
  significance: 'low' | 'medium' | 'high' | 'exceptional';
  userJourneyStage: 'newcomer' | 'explorer' | 'builder' | 'optimizer' | 'mentor';
  emotionalContext: 'relief' | 'pride' | 'accomplishment' | 'joy' | 'confidence' | 'gratitude';
  personalRelevance: 'personal' | 'family' | 'professional' | 'community' | 'legacy';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  timeInvestment: number; // in minutes
  userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  previousAttempts?: number;
  improvement?: number; // percentage improvement over previous attempts
}

export interface SuccessMessageTemplate {
  id: string;
  achievementType: UserAchievement['type'];
  category: UserAchievement['category'];
  userJourneyStage: UserAchievement['userJourneyStage'];
  emotionalContext: UserAchievement['emotionalContext'];
  personalRelevance: UserAchievement['personalRelevance'];
  userExpertise: UserAchievement['userExpertise'];
  message: string;
  sofiaMessage?: string;
  celebrationStyle: 'subtle' | 'moderate' | 'enthusiastic' | 'grand';
  visualStyle: 'minimal' | 'elegant' | 'vibrant' | 'premium';
  duration: number; // in seconds
  followUpActions?: SuccessFollowUpAction[];
  culturalAdaptation?: Record<string, string>; // language/cultural variants
}

export interface SuccessFollowUpAction {
  id: string;
  type: 'suggestion' | 'encouragement' | 'next_step' | 'celebration' | 'sharing' | 'reflection';
  label: string;
  description: string;
  action?: () => void;
  delay: number; // delay before showing this action
  priority: 'low' | 'medium' | 'high';
  contextual: boolean; // whether to show based on context
}

export interface PersonalizedSuccessMessage {
  id: string;
  achievement: UserAchievement;
  template: SuccessMessageTemplate;
  personalizedMessage: string;
  personalizedSofiaMessage?: string;
  celebrationSequence: CelebrationSequence;
  followUpActions: SuccessFollowUpAction[];
  analytics: SuccessMessageAnalytics;
  accessibility: SuccessAccessibilityFeatures;
}

export interface CelebrationSequence {
  id: string;
  name: string;
  steps: CelebrationStep[];
  duration: number;
  intensity: 'gentle' | 'moderate' | 'intense' | 'grand';
  emotionalTone: 'warm' | 'excited' | 'proud' | 'joyful' | 'accomplished';
}

export interface CelebrationStep {
  id: string;
  type: 'animation' | 'sound' | 'haptic' | 'message' | 'particle' | 'icon' | 'color';
  content: any;
  duration: number;
  delay: number;
  easing: string;
}

export interface SuccessMessageAnalytics {
  messageId: string;
  achievementId: string;
  userId: string;
  timestamp: number;
  effectiveness: number; // 0-1 score
  engagement: number; // 0-1 score
  emotionalImpact: number; // -1 to 1 (negative to positive)
  userRetention: boolean;
  followUpActionTaken: boolean;
  messageResonance: number; // 0-1 how well the message resonated
}

export interface SuccessAccessibilityFeatures {
  screenReaderMessage: string;
  reducedMotionAlternative: string;
  highContrastSupport: boolean;
  keyboardNavigation: boolean;
  voiceAnnouncement: string;
  tactileFeedback: boolean;
}

export interface PersonalizedSuccessMessagesProps {
  achievement: UserAchievement;
  onMessageComplete?: (messageId: string, analytics: SuccessMessageAnalytics) => void;
  onFollowUpAction?: (actionId: string, achievementId: string) => void;
  showSofia?: boolean;
  autoProgress?: boolean;
  enableCelebration?: boolean;
  enableFollowUps?: boolean;
  className?: string;
}

// Advanced success message engine
class SuccessMessageEngine {
  private templates: Map<string, SuccessMessageTemplate[]> = new Map();
  private userHistory: Map<string, any[]> = new Map();
  private personalizationRules: Map<string, any> = new Map();

  constructor() {
    this.initializeTemplates();
    this.initializePersonalizationRules();
  }

  private initializeTemplates(): void {
    // Milestone achievement templates
    this.templates.set('milestone', [
      {
        id: 'first-document-milestone',
        achievementType: 'milestone',
        category: 'document',
        userJourneyStage: 'newcomer',
        emotionalContext: 'accomplishment',
        personalRelevance: 'personal',
        userExpertise: 'beginner',
        message: 'Congratulations! You\'ve taken your first step toward securing your legacy.',
        sofiaMessage: 'I\'m so proud of you for starting this important journey! 🌟',
        celebrationStyle: 'moderate',
        visualStyle: 'elegant',
        duration: 4,
        culturalAdaptation: {
          'es': '¡Felicitaciones! Has dado tu primer paso hacia asegurar tu legado.',
          'fr': 'Félicitations ! Vous avez fait votre premier pas vers la sécurisation de votre héritage.',
          'de': 'Herzlichen Glückwunsch! Sie haben den ersten Schritt zur Sicherung Ihres Erbes gemacht.'
        }
      },
      {
        id: 'family-connection-milestone',
        achievementType: 'milestone',
        category: 'family',
        userJourneyStage: 'explorer',
        emotionalContext: 'joy',
        personalRelevance: 'family',
        userExpertise: 'intermediate',
        message: 'Beautiful! You\'ve connected with your loved ones through LegacyGuard.',
        sofiaMessage: 'Family connections are the most precious gifts. I\'m delighted you\'ve strengthened yours! 💝',
        celebrationStyle: 'enthusiastic',
        visualStyle: 'vibrant',
        duration: 5,
        culturalAdaptation: {
          'es': '¡Hermoso! Has conectado con tus seres queridos a través de LegacyGuard.',
          'fr': 'Magnifique ! Vous vous êtes connecté avec vos proches grâce à LegacyGuard.',
          'de': 'Wunderschön! Sie haben sich über LegacyGuard mit Ihren Lieben verbunden.'
        }
      }
    ]);

    // Completion achievement templates
    this.templates.set('completion', [
      {
        id: 'will-completion',
        achievementType: 'completion',
        category: 'planning',
        userJourneyStage: 'builder',
        emotionalContext: 'pride',
        personalRelevance: 'legacy',
        userExpertise: 'advanced',
        message: 'Exceptional work! Your comprehensive will is now complete and secure.',
        sofiaMessage: 'This is a tremendous accomplishment. You\'ve created something truly meaningful for your family\'s future. 🏆',
        celebrationStyle: 'grand',
        visualStyle: 'premium',
        duration: 6,
        culturalAdaptation: {
          'es': '¡Trabajo excepcional! Tu testamento integral está ahora completo y seguro.',
          'fr': 'Travail exceptionnel ! Votre testament complet est maintenant terminé et sécurisé.',
          'de': 'Außergewöhnliche Arbeit! Ihr umfassendes Testament ist jetzt vollständig und sicher.'
        }
      }
    ]);

    // Improvement achievement templates
    this.templates.set('improvement', [
      {
        id: 'efficiency-improvement',
        achievementType: 'improvement',
        category: 'organization',
        userJourneyStage: 'optimizer',
        emotionalContext: 'confidence',
        personalRelevance: 'professional',
        userExpertise: 'expert',
        message: 'You\'re becoming more efficient! Your latest organization saved significant time.',
        sofiaMessage: 'I love seeing you grow and optimize! Every improvement makes a difference. 📈',
        celebrationStyle: 'moderate',
        visualStyle: 'elegant',
        duration: 4,
        culturalAdaptation: {
          'es': '¡Te estás volviendo más eficiente! Tu última organización ahorró tiempo significativo.',
          'fr': 'Vous devenez plus efficace ! Votre dernière organisation a permis de gagner du temps.',
          'de': 'Sie werden effizienter! Ihre neueste Organisation hat erheblich Zeit gespart.'
        }
      }
    ]);
  }

  private initializePersonalizationRules(): void {
    this.personalizationRules.set('user_journey_stage', {
      'newcomer': {
        focus: 'encouragement',
        tone: 'supportive',
        complexity: 'simple',
        celebration: 'gentle'
      },
      'explorer': {
        focus: 'discovery',
        tone: 'excited',
        complexity: 'moderate',
        celebration: 'moderate'
      },
      'builder': {
        focus: 'accomplishment',
        tone: 'proud',
        complexity: 'detailed',
        celebration: 'enthusiastic'
      },
      'optimizer': {
        focus: 'excellence',
        tone: 'confident',
        complexity: 'sophisticated',
        celebration: 'grand'
      },
      'mentor': {
        focus: 'leadership',
        tone: 'inspiring',
        complexity: 'expert',
        celebration: 'premium'
      }
    });

    this.personalizationRules.set('emotional_context', {
      'relief': { emoji: '😌', tone: 'calm', focus: 'comfort' },
      'pride': { emoji: '😊', tone: 'warm', focus: 'achievement' },
      'accomplishment': { emoji: '🎉', tone: 'celebratory', focus: 'success' },
      'joy': { emoji: '😄', tone: 'joyful', focus: 'happiness' },
      'confidence': { emoji: '💪', tone: 'strong', focus: 'growth' },
      'gratitude': { emoji: '🙏', tone: 'appreciative', focus: 'thanks' }
    });
  }

  generatePersonalizedMessage(achievement: UserAchievement): PersonalizedSuccessMessage {
    // Find the best template match
    const template = this.findBestTemplate(achievement);

    // Personalize the message based on user context
    const personalizedMessage = this.personalizeMessage(template, achievement);

    // Generate Sofia message
    const sofiaGenerator = new SofiaMessageGenerator();
    const personalizedSofiaMessage = sofiaGenerator.generateMessage({
      type: 'success_celebration',
      context: achievement.category,
      emotionalTone: achievement.emotionalContext,
      userEmotionalState: achievement.emotionalContext,
      urgency: 'low'
    });

    // Create celebration sequence
    const celebrationSequence = this.createCelebrationSequence(achievement, template);

    // Generate follow-up actions
    const followUpActions = this.generateFollowUpActions(achievement, template);

    // Create analytics
    const analytics: SuccessMessageAnalytics = {
      messageId: `success-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      achievementId: achievement.id,
      userId: 'current-user', // Would come from auth context
      timestamp: Date.now(),
      effectiveness: 0,
      engagement: 0,
      emotionalImpact: 0,
      userRetention: false,
      followUpActionTaken: false,
      messageResonance: 0
    };

    // Create accessibility features
    const accessibility = this.createAccessibilityFeatures(achievement, template);

    return {
      id: `personalized-success-${Date.now()}`,
      achievement,
      template,
      personalizedMessage,
      personalizedSofiaMessage,
      celebrationSequence,
      followUpActions,
      analytics,
      accessibility
    };
  }

  private findBestTemplate(achievement: UserAchievement): SuccessMessageTemplate {
    const relevantTemplates = this.templates.get(achievement.type) || [];

    // Score templates based on how well they match the achievement
    const scoredTemplates = relevantTemplates.map(template => ({
      template,
      score: this.calculateTemplateScore(template, achievement)
    }));

    // Return the highest scoring template
    const bestMatch = scoredTemplates.sort((a, b) => b.score - a.score)[0];
    return bestMatch?.template || this.createFallbackTemplate(achievement);
  }

  private calculateTemplateScore(template: SuccessMessageTemplate, achievement: UserAchievement): number {
    let score = 0;

    // Exact matches get high scores
    if (template.achievementType === achievement.type) score += 30;
    if (template.category === achievement.category) score += 25;
    if (template.userJourneyStage === achievement.userJourneyStage) score += 20;
    if (template.emotionalContext === achievement.emotionalContext) score += 15;
    if (template.personalRelevance === achievement.personalRelevance) score += 10;
    if (template.userExpertise === achievement.userExpertise) score += 10;

    // Partial matches get lower scores
    if (template.userJourneyStage !== achievement.userJourneyStage) score -= 5;
    if (template.userExpertise !== achievement.userExpertise) score -= 3;

    return Math.max(score, 0);
  }

  private createFallbackTemplate(achievement: UserAchievement): SuccessMessageTemplate {
    return {
      id: 'fallback-template',
      achievementType: achievement.type,
      category: achievement.category,
      userJourneyStage: achievement.userJourneyStage,
      emotionalContext: achievement.emotionalContext,
      personalRelevance: achievement.personalRelevance,
      userExpertise: achievement.userExpertise,
      message: 'Great work! You\'ve achieved something meaningful.',
      sofiaMessage: 'I\'m so happy for you! Every step forward is a victory. 🎊',
      celebrationStyle: 'moderate',
      visualStyle: 'elegant',
      duration: 3
    };
  }

  private personalizeMessage(template: SuccessMessageTemplate, achievement: UserAchievement): string {
    let message = template.message;

    // Add personalization based on achievement context
    if (achievement.previousAttempts && achievement.previousAttempts > 1) {
      message = message.replace('Congratulations', 'Congratulations on your persistence');
    }

    if (achievement.improvement && achievement.improvement > 20) {
      message = message.replace('work', 'excellent work');
    }

    if (achievement.timeInvestment > 60) {
      message = message.replace('step', 'significant step');
    }

    // Add emotional context
    const emotionalRules = this.personalizationRules.get('emotional_context');
    const emotionalContext = emotionalRules?.[achievement.emotionalContext];

    if (emotionalContext) {
      message += ` ${emotionalContext.emoji}`;
    }

    return message;
  }

  private createCelebrationSequence(achievement: UserAchievement, template: SuccessMessageTemplate): CelebrationSequence {
    const steps: CelebrationStep[] = [
      {
        id: 'fade-in',
        type: 'animation',
        content: { opacity: [0, 1] },
        duration: 0.5,
        delay: 0,
        easing: 'easeOut'
      },
      {
        id: 'scale-up',
        type: 'animation',
        content: { scale: [0.8, 1.1, 1] },
        duration: 0.6,
        delay: 0.2,
        easing: 'spring'
      },
      {
        id: 'color-burst',
        type: 'color',
        content: { background: ['transparent', 'rgba(255,255,255,0.1)', 'transparent'] },
        duration: 1,
        delay: 0.8,
        easing: 'easeInOut'
      }
    ];

    return {
      id: `celebration-${achievement.id}`,
      name: `${achievement.type} Celebration`,
      steps,
      duration: template.duration,
      intensity: template.celebrationStyle === 'grand' ? 'intense' : 'moderate',
      emotionalTone: this.mapEmotionalContextToTone(achievement.emotionalContext)
    };
  }

  private generateFollowUpActions(achievement: UserAchievement, template: SuccessMessageTemplate): SuccessFollowUpAction[] {
    const actions: SuccessFollowUpAction[] = [];

    // Add context-specific follow-up actions
    switch (achievement.category) {
      case 'document':
        actions.push({
          id: 'share-progress',
          type: 'sharing',
          label: 'Share your progress',
          description: 'Let your family know about this milestone',
          delay: 2,
          priority: 'medium',
          contextual: true
        });
        break;

      case 'family':
        actions.push({
          id: 'family-celebration',
          type: 'celebration',
          label: 'Celebrate with family',
          description: 'Share this moment with your loved ones',
          delay: 1.5,
          priority: 'high',
          contextual: true
        });
        break;

      case 'security':
        actions.push({
          id: 'security-review',
          type: 'next_step',
          label: 'Review security settings',
          description: 'Ensure everything is properly secured',
          delay: 3,
          priority: 'medium',
          contextual: true
        });
        break;
    }

    // Add general encouragement action
    actions.push({
      id: 'continue-journey',
      type: 'encouragement',
      label: 'Continue your journey',
      description: 'Keep building on this success',
      delay: 4,
      priority: 'low',
      contextual: false
    });

    return actions.sort((a, b) => a.delay - b.delay);
  }

  private createAccessibilityFeatures(achievement: UserAchievement, template: SuccessMessageTemplate): SuccessAccessibilityFeatures {
    return {
      screenReaderMessage: `Success: ${template.message}. Achievement: ${achievement.type} in ${achievement.category}.`,
      reducedMotionAlternative: 'Success message displayed with reduced motion.',
      highContrastSupport: true,
      keyboardNavigation: true,
      voiceAnnouncement: template.message,
      tactileFeedback: achievement.significance === 'high' || achievement.significance === 'exceptional'
    };
  }

  learnFromUserResponse(messageId: string, response: 'positive' | 'neutral' | 'negative'): void {
    // Learn from user responses to improve future messages
    const history = this.userHistory.get('message_responses') || [];
    history.push({
      messageId,
      response,
      timestamp: Date.now()
    });
    this.userHistory.set('message_responses', history);
  }

  private mapEmotionalContextToTone(emotionalContext: UserAchievement['emotionalContext']): CelebrationSequence['emotionalTone'] {
    const mapping: Record<UserAchievement['emotionalContext'], CelebrationSequence['emotionalTone']> = {
      'relief': 'warm',
      'pride': 'proud',
      'accomplishment': 'accomplished',
      'joy': 'joyful',
      'confidence': 'proud',
      'gratitude': 'warm'
    };

    return mapping[emotionalContext] || 'warm';
  }
}

// Main component implementation
export const PersonalizedSuccessMessages: React.FC<PersonalizedSuccessMessagesProps> = ({
  achievement,
  onMessageComplete,
  onFollowUpAction,
  showSofia = true,
  autoProgress = true,
  enableCelebration = true,
  enableFollowUps = true,
  className = ''
}) => {
  const [currentMessage, setCurrentMessage] = useState<PersonalizedSuccessMessage | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showFollowUps, setShowFollowUps] = useState(false);

  const messageEngine = useRef(new SuccessMessageEngine());
  const analytics = useRef(new PersonalizedSuccessAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();

  // Generate personalized message when achievement changes
  useEffect(() => {
    if (achievement) {
      const message = messageEngine.current.generatePersonalizedMessage(achievement);
      setCurrentMessage(message);
      setShowMessage(true);

      // Track message generation
      analytics.current.trackMessageGeneration(message, achievement);
    }
  }, [achievement]);

  // Auto-progress through celebration sequence
  useEffect(() => {
    if (autoProgress && currentMessage && enableCelebration) {
      const sequence = currentMessage.celebrationSequence;

      sequence.steps.forEach((step, index) => {
        setTimeout(() => {
          setCurrentStepIndex(index);
        }, step.delay * 1000);
      });

      // Show follow-up actions after celebration
      if (enableFollowUps) {
        setTimeout(() => {
          setShowFollowUps(true);
        }, sequence.duration * 1000);
      }
    }
  }, [autoProgress, currentMessage, enableCelebration, enableFollowUps]);

  const handleFollowUpAction = useCallback((action: SuccessFollowUpAction) => {
    onFollowUpAction?.(action.id, achievement.id);

    // Track follow-up action
    analytics.current.trackFollowUpAction(action.id, achievement.id);

    // Learn from user engagement
    messageEngine.current.learnFromUserResponse(currentMessage!.id, 'positive');
  }, [onFollowUpAction, achievement.id, currentMessage]);

  const handleMessageComplete = useCallback(() => {
    if (currentMessage) {
      // Update analytics
      const updatedAnalytics = {
        ...currentMessage.analytics,
        effectiveness: 0.9,
        engagement: 0.85,
        emotionalImpact: 0.8,
        messageResonance: 0.9
      };

      onMessageComplete?.(currentMessage.id, updatedAnalytics);
      analytics.current.trackMessageCompletion(currentMessage.id, updatedAnalytics);
    }
  }, [currentMessage, onMessageComplete]);

  if (!currentMessage) {
    return null;
  }

  return (
    <div className={`personalized-success-messages ${className}`}>
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="success-message-container"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* Main success message */}
            <motion.div
              className={`success-message success-message--${currentMessage.template.visualStyle}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="success-content">
                <h2 className="success-title">{currentMessage.personalizedMessage}</h2>

                {currentMessage.personalizedSofiaMessage && showSofia && (
                  <motion.div
                    className="sofia-success-message"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="sofia-avatar">
                      <span className="sofia-avatar__emoji">🧚‍♀️</span>
                    </div>
                    <div className="sofia-message-bubble">
                      <p>{currentMessage.personalizedSofiaMessage}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Celebration animation */}
            {enableCelebration && (
              <motion.div
                className="celebration-animation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {currentMessage.celebrationSequence.steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={`celebration-step celebration-step--${step.type}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: step.delay }}
                  >
                    {/* Celebration step content would be rendered here */}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Follow-up actions */}
            {enableFollowUps && showFollowUps && (
              <motion.div
                className="follow-up-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {currentMessage.followUpActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    className={`follow-up-action follow-up-action--${action.priority}`}
                    onClick={() => handleFollowUpAction(action)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + (index * 0.1) }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="action-label">{action.label}</span>
                    <span className="action-description">{action.description}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalizedSuccessMessages;