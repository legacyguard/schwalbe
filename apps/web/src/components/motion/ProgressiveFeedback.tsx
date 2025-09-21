/**
 * ProgressiveFeedback - Advanced multi-stage feedback system for complex actions
 *
 * Features:
 * - Multi-stage feedback progression for complex user journeys
 * - Context-aware feedback adaptation based on user behavior
 * - Emotional intelligence integration with Sofia AI
 * - Progressive disclosure of information and guidance
 * - Smart timing and sequencing of feedback stages
 * - Accessibility-first design with comprehensive screen reader support
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
import { FeedbackAnalytics } from '../../utils/FeedbackAnalytics.js';

// TypeScript interfaces for comprehensive type safety
export interface FeedbackStage {
  id: string;
  name: string;
  description: string;
  sofiaMessage?: string;
  duration: number;
  visualStyle: 'minimal' | 'prominent' | 'celebratory' | 'guidance' | 'warning' | 'urgent';
  emotionalTone: 'encouraging' | 'supportive' | 'celebratory' | 'gentle' | 'urgent';
  actions?: FeedbackAction[];
  progress?: number;
  isFinal?: boolean;
}

export interface FeedbackAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'destructive' | 'guidance';
  emotionalImpact: 'positive' | 'neutral' | 'negative';
  requiresConfirmation?: boolean;
  estimatedTime?: number;
}

export interface FeedbackContext {
  userActivity: 'browsing' | 'creating' | 'reviewing' | 'planning' | 'troubleshooting';
  emotionalState: 'calm' | 'anxious' | 'excited' | 'overwhelmed' | 'focused' | 'frustrated';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  urgency: 'low' | 'medium' | 'high';
  previousFailures?: number;
  userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface FeedbackSequence {
  id: string;
  name: string;
  description: string;
  stages: FeedbackStage[];
  context: FeedbackContext;
  estimatedDuration: number;
  successRate?: number;
  userSatisfaction?: number;
}

export interface ProgressiveFeedbackProps {
  sequence: FeedbackSequence;
  isActive: boolean;
  onStageComplete?: (stageId: string, result: 'success' | 'skip' | 'fail') => void;
  onSequenceComplete?: (sequenceId: string, overallResult: 'success' | 'partial' | 'fail') => void;
  onAction?: (actionId: string, stageId: string) => void;
  onFeedbackEngage?: (stageId: string, engagement: 'view' | 'interact' | 'dismiss') => void;
  autoProgress?: boolean;
  allowSkip?: boolean;
  showProgress?: boolean;
  className?: string;
}

// Advanced feedback progression engine
class FeedbackProgressionEngine {
  private userPatterns: Map<string, any> = new Map();
  private emotionalContext: Map<string, any> = new Map();
  private timingOptimizer: Map<string, any> = new Map();

  analyzeOptimalProgression(context: FeedbackContext, stages: FeedbackStage[]): {
    sequence: FeedbackStage[];
    timing: number[];
    adaptations: string[];
  } {
    const { emotionalState, complexity, userExpertise, previousFailures } = context;

    // Adapt sequence based on emotional state
    let adaptedStages = [...stages];
    let timingAdjustments: number[] = stages.map(s => s.duration);
    const adaptations: string[] = [];

    if (emotionalState === 'anxious') {
      // Add reassurance stages for anxious users
      const reassuranceStage: FeedbackStage = {
        id: 'anxiety-reassurance',
        name: 'Taking a breath',
        description: 'Let\'s take this one step at a time',
        duration: 3000,
        visualStyle: 'minimal',
        emotionalTone: 'supportive'
      };
      adaptedStages.splice(1, 0, reassuranceStage);
      timingAdjustments.splice(1, 0, 3000);
      adaptations.push('Added anxiety reassurance stage');
    }

    if (emotionalState === 'overwhelmed') {
      // Simplify complex sequences for overwhelmed users
      adaptedStages = adaptedStages.filter((_, index) => index <= 2);
      timingAdjustments = timingAdjustments.slice(0, 3);
      adaptations.push('Simplified sequence for overwhelmed user');
    }

    if (previousFailures && previousFailures > 2) {
      // Add extra guidance for users with repeated failures
      const guidanceStage: FeedbackStage = {
        id: 'failure-guidance',
        name: 'Let me help you',
        description: 'I notice this is challenging - let\'s try a different approach',
        duration: 4000,
        visualStyle: 'guidance',
        emotionalTone: 'supportive'
      };
      adaptedStages.splice(1, 0, guidanceStage);
      timingAdjustments.splice(1, 0, 4000);
      adaptations.push('Added failure recovery guidance');
    }

    // Adjust timing based on user expertise
    if (userExpertise === 'beginner') {
      timingAdjustments = timingAdjustments.map(t => t * 1.5);
      adaptations.push('Extended timing for beginner user');
    }

    if (userExpertise === 'expert') {
      timingAdjustments = timingAdjustments.map(t => Math.max(t * 0.7, 1000));
      adaptations.push('Accelerated timing for expert user');
    }

    return {
      sequence: adaptedStages,
      timing: timingAdjustments,
      adaptations
    };
  }

  learnFromInteraction(sequenceId: string, interaction: {
    stageId: string;
    result: 'success' | 'skip' | 'fail';
    timeSpent: number;
    emotionalResponse?: string;
  }): void {
    const pattern = this.userPatterns.get(sequenceId) || [];
    pattern.push(interaction);
    this.userPatterns.set(sequenceId, pattern);

    // Update emotional context
    if (interaction.emotionalResponse) {
      const emotional = this.emotionalContext.get(sequenceId) || {};
      emotional.lastResponse = interaction.emotionalResponse;
      emotional.interactionCount = (emotional.interactionCount || 0) + 1;
      this.emotionalContext.set(sequenceId, emotional);
    }
  }
}

// Smart timing engine for feedback stages
class FeedbackTimingEngine {
  calculateOptimalTiming(
    stage: FeedbackStage,
    context: FeedbackContext,
    userHistory: any[]
  ): {
    duration: number;
    delay: number;
    reason: string;
  } {
    const { emotionalState, complexity, urgency } = context;

    let duration = stage.duration;
    let delay = 0;
    let reason = 'Standard timing';

    // Adjust based on emotional state
    if (emotionalState === 'anxious') {
      duration *= 1.3; // Give more time to anxious users
      reason = 'Extended timing for anxious user';
    }

    if (emotionalState === 'focused') {
      duration *= 0.9; // Faster for focused users
      reason = 'Accelerated timing for focused user';
    }

    // Adjust based on complexity
    if (complexity === 'complex') {
      duration *= 1.4;
      reason = 'Extended timing for complex action';
    }

    // Add delay for urgent situations to prevent overwhelming
    if (urgency === 'high' && emotionalState === 'overwhelmed') {
      delay = 2000;
      reason = 'Added delay to prevent overwhelming user';
    }

    // Consider user history
    if (userHistory.length > 0) {
      const avgTime = userHistory.reduce((sum, h) => sum + h.timeSpent, 0) / userHistory.length;
      if (avgTime > duration * 1.5) {
        duration = avgTime * 0.9; // Slightly faster than average
        reason = 'Adapted to user\'s typical pace';
      }
    }

    return { duration, delay, reason };
  }
}

// Main component implementation
export const ProgressiveFeedback: React.FC<ProgressiveFeedbackProps> = ({
  sequence,
  isActive,
  onStageComplete,
  onSequenceComplete,
  onAction,
  onFeedbackEngage,
  autoProgress = true,
  allowSkip = true,
  showProgress = true,
  className = ''
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stageResults, setStageResults] = useState<Map<string, 'success' | 'skip' | 'fail'>>(new Map());
  const [userInteractions, setUserInteractions] = useState<any[]>([]);
  const [adaptations, setAdaptations] = useState<string[]>([]);

  const progressionEngine = useRef(new FeedbackProgressionEngine());
  const timingEngine = useRef(new FeedbackTimingEngine());
  const analytics = useRef(new FeedbackAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();

  const [adaptedSequence, setAdaptedSequence] = useState<FeedbackStage[]>(sequence.stages);
  const [stageTiming, setStageTiming] = useState<number[]>(sequence.stages.map(s => s.duration));

  // Adapt sequence when context changes
  useEffect(() => {
    if (isActive) {
      const result = progressionEngine.current.analyzeOptimalProgression(
        sequence.context,
        sequence.stages
      );

      setAdaptedSequence(result.sequence);
      setStageTiming(result.timing);
      setAdaptations(result.adaptations);

      analytics.current.trackAdaptation(sequence.id, result.adaptations);
    }
  }, [sequence, isActive]);

  // Auto-progress through stages
  useEffect(() => {
    if (!isActive || !autoProgress || !isPlaying) return;

    const currentStage = adaptedSequence[currentStageIndex];
    if (!currentStage) return;

    const timing = timingEngine.current.calculateOptimalTiming(
      currentStage,
      sequence.context,
      userInteractions
    );

    const timer = setTimeout(() => {
      handleStageComplete('success');
    }, timing.duration + timing.delay);

    return () => clearTimeout(timer);
  }, [currentStageIndex, isActive, autoProgress, isPlaying, adaptedSequence, sequence.context, userInteractions]);

  const handleStageComplete = useCallback((result: 'success' | 'skip' | 'fail') => {
    const currentStage = adaptedSequence[currentStageIndex];
    if (!currentStage) return;

    // Record stage result
    setStageResults(prev => new Map(prev.set(currentStage.id, result)));

    // Learn from interaction
    progressionEngine.current.learnFromInteraction(sequence.id, {
      stageId: currentStage.id,
      result,
      timeSpent: stageTiming[currentStageIndex] || currentStage.duration,
      emotionalResponse: emotionalState
    });

    // Track analytics
    analytics.current.trackStageComplete(sequence.id, currentStage.id, result, emotionalState);

    // Call completion callback
    onStageComplete?.(currentStage.id, result);

    // Move to next stage or complete sequence
    if (currentStageIndex < adaptedSequence.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
    } else {
      const overallResult = Array.from(stageResults.values()).every(r => r === 'success')
        ? 'success'
        : Array.from(stageResults.values()).some(r => r === 'success')
        ? 'partial'
        : 'fail';

      onSequenceComplete?.(sequence.id, overallResult);
      setIsPlaying(false);
    }
  }, [currentStageIndex, adaptedSequence, stageResults, sequence.id, emotionalState, onStageComplete, onSequenceComplete, stageTiming]);

  const handleAction = useCallback((actionId: string) => {
    const currentStage = adaptedSequence[currentStageIndex];
    if (!currentStage) return;

    onAction?.(actionId, currentStage.id);
    onFeedbackEngage?.(currentStage.id, 'interact');

    // Record interaction
    setUserInteractions(prev => [...prev, {
      stageId: currentStage.id,
      actionId,
      timestamp: Date.now(),
      emotionalState
    }]);
  }, [currentStageIndex, adaptedSequence, onAction, onFeedbackEngage, emotionalState]);

  const handleSkip = useCallback(() => {
    if (!allowSkip) return;
    handleStageComplete('skip');
  }, [allowSkip, handleStageComplete]);

  const handleRestart = useCallback(() => {
    setCurrentStageIndex(0);
    setStageResults(new Map());
    setUserInteractions([]);
    setIsPlaying(true);
  }, []);

  const generateSofiaMessage = useCallback((stage: FeedbackStage): string => {
    const sofiaGenerator = new SofiaMessageGenerator();

    return sofiaGenerator.generateMessage({
      type: 'feedback',
      context: stage.visualStyle,
      emotionalTone: stage.emotionalTone,
      userEmotionalState: emotionalState,
      urgency: sequence.context.urgency
    });
  }, [emotionalState, sequence.context.urgency]);

  // Calculate overall progress
  const overallProgress = adaptedSequence.length > 0
    ? ((currentStageIndex + (stageResults.size / adaptedSequence.length)) / adaptedSequence.length) * 100
    : 0;

  const currentStage = adaptedSequence[currentStageIndex];
  const sofiaMessage = currentStage ? generateSofiaMessage(currentStage) : '';

  // Stage variants for different visual styles
  const getStageVariants = (style: FeedbackStage['visualStyle']) => {
    const baseVariants = {
      hidden: {
        opacity: 0,
        scale: 0.9,
        y: 20,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        y: -10,
        transition: { duration: 0.3 }
      }
    };

    if (style === 'celebratory') {
      return {
        ...baseVariants,
        visible: {
          ...baseVariants.visible,
          rotate: [0, -2, 2, 0],
          transition: {
            ...baseVariants.visible.transition,
            rotate: {
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut'
            }
          }
        }
      };
    }

    return baseVariants;
  };

  if (!isActive || !currentStage) {
    return null;
  }

  return (
    <div className={`progressive-feedback ${className}`}>
      {/* Progress indicator */}
      {showProgress && (
        <div className="progressive-feedback__progress">
          <div className="progressive-feedback__progress-bar">
            <motion.div
              className="progressive-feedback__progress-fill"
              initial={{ width: '0%' }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="progressive-feedback__progress-text">
            Step {currentStageIndex + 1} of {adaptedSequence.length}
          </div>
        </div>
      )}

      {/* Adaptations indicator */}
      {adaptations.length > 0 && (
        <div className="progressive-feedback__adaptations">
          {adaptations.map((adaptation, index) => (
            <div key={index} className="adaptation-badge">
              {adaptation}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage.id}
          className={`feedback-stage feedback-stage--${currentStage.visualStyle}`}
          variants={getStageVariants(currentStage.visualStyle)}
          initial="hidden"
          animate="visible"
          exit="exit"
          onHoverStart={() => onFeedbackEngage?.(currentStage.id, 'view')}
        >
          {/* Stage header */}
          <div className="feedback-stage__header">
            <h3 className="feedback-stage__title">{currentStage.name}</h3>
            {currentStage.visualStyle === 'urgent' && (
              <div className="feedback-stage__urgency-indicator" />
            )}
          </div>

          {/* Stage description */}
          <p className="feedback-stage__description">{currentStage.description}</p>

          {/* Sofia message */}
          {sofiaMessage && (
            <div className="feedback-stage__sofia">
              <div className="sofia-avatar">
                <span className="sofia-avatar__emoji">🧚‍♀️</span>
              </div>
              <p className="sofia-message">{sofiaMessage}</p>
            </div>
          )}

          {/* Progress indicator for current stage */}
          <div className="feedback-stage__progress">
            <motion.div
              className="feedback-stage__progress-bar"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{
                duration: (stageTiming[currentStageIndex] || currentStage.duration) / 1000,
                ease: 'linear'
              }}
            />
          </div>

          {/* Actions */}
          {currentStage.actions && currentStage.actions.length > 0 && (
            <div className="feedback-stage__actions">
              {currentStage.actions.map((action) => (
                <button
                  key={action.id}
                  className={`feedback-action feedback-action--${action.type} ${
                    action.emotionalImpact === 'positive' ? 'feedback-action--positive' : ''
                  } ${
                    action.emotionalImpact === 'negative' ? 'feedback-action--negative' : ''
                  }`}
                  onClick={() => handleAction(action.id)}
                  disabled={action.requiresConfirmation && !isPlaying}
                >
                  {action.label}
                  {action.estimatedTime && (
                    <span className="feedback-action__time">
                      ~{action.estimatedTime}s
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Stage controls */}
          <div className="feedback-stage__controls">
            {allowSkip && currentStageIndex > 0 && (
              <button
                className="feedback-control feedback-control--skip"
                onClick={handleSkip}
              >
                Skip this step
              </button>
            )}

            <button
              className="feedback-control feedback-control--restart"
              onClick={handleRestart}
            >
              Start over
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Sequence controls */}
      <div className="progressive-feedback__controls">
        <button
          className="sequence-control sequence-control--play"
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={!autoProgress}
        >
          {isPlaying ? 'Pause' : 'Continue'}
        </button>

        <button
          className="sequence-control sequence-control--restart"
          onClick={handleRestart}
        >
          Restart sequence
        </button>
      </div>
    </div>
  );
};

export default ProgressiveFeedback;