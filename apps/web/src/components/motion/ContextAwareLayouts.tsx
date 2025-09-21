import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

// Context-aware layout configuration interface
export interface ContextAwareLayoutConfig {
  id: string;
  name: string;
  description: string;
  category: 'dashboard' | 'workspace' | 'content' | 'navigation' | 'form' | 'gallery' | 'document' | 'social';
  adaptation: 'static' | 'reactive' | 'predictive' | 'intelligent' | 'emotional' | 'collaborative';
  learning: 'none' | 'passive' | 'active' | 'supervised' | 'unsupervised' | 'reinforcement';
  behavior: 'conservative' | 'balanced' | 'aggressive' | 'experimental' | 'personalized' | 'contextual';
  prediction: 'rule-based' | 'statistical' | 'machine-learning' | 'neural' | 'hybrid' | 'intuitive';
  memory: 'session' | 'persistent' | 'adaptive' | 'contextual' | 'emotional' | 'collaborative';
  userModel?: {
    experience: 'novice' | 'intermediate' | 'expert' | 'adaptive';
    preferences: Record<string, any>;
    patterns: UserPattern[];
    emotionalProfile: EmotionalProfile;
    cognitiveLoad: 'low' | 'medium' | 'high' | 'adaptive';
  };
  contextFactors?: {
    timeOfDay?: boolean;
    dayOfWeek?: boolean;
    deviceType?: boolean;
    location?: boolean;
    activity?: boolean;
    mood?: boolean;
    urgency?: boolean;
    complexity?: boolean;
  };
}

export interface UserPattern {
  id: string;
  type: 'navigation' | 'interaction' | 'preference' | 'emotional' | 'cognitive' | 'temporal';
  pattern: string;
  confidence: number;
  frequency: number;
  recency: number;
  context: Record<string, any>;
  prediction: {
    nextAction: string;
    probability: number;
    alternatives: Array<{ action: string; probability: number }>;
  };
}

export interface EmotionalProfile {
  baseline: 'calm' | 'energetic' | 'focused' | 'creative' | 'analytical' | 'social';
  current: 'stressed' | 'relaxed' | 'focused' | 'distracted' | 'excited' | 'frustrated';
  traits: Record<string, number>;
  triggers: string[];
  coping: string[];
}

export interface LayoutElement {
  id: string;
  content: React.ReactNode;
  priority: 'background' | 'supporting' | 'featured' | 'hero' | 'accent';
  size: 'compact' | 'normal' | 'prominent' | 'dominant' | 'adaptive';
  position: 'edge' | 'center' | 'offset' | 'corner' | 'floating' | 'contextual';
  behavior: 'static' | 'floating' | 'magnetic' | 'repulsive' | 'orbital' | 'flowing' | 'predictive';
  interaction: 'passive' | 'hover' | 'click' | 'drag' | 'scroll' | 'gaze' | 'voice';
  context: {
    importance: number;
    urgency: number;
    complexity: number;
    emotionalWeight: number;
    userPreference: number;
    situationalRelevance: number;
  };
  metadata?: Record<string, any>;
}

export interface ContextAwareLayoutProps {
  config: ContextAwareLayoutConfig;
  elements: LayoutElement[];
  children?: React.ReactNode;
  containerWidth?: number;
  containerHeight?: number;
  userId?: string;
  sessionId?: string;
  enableLearning?: boolean;
  enablePrediction?: boolean;
  enableEmotional?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onUserPattern?: (pattern: UserPattern) => void;
  onLayoutAdaptation?: (adaptation: LayoutAdaptation, reason: string) => void;
  onPrediction?: (prediction: LayoutPrediction, confidence: number) => void;
  onEmotionalContext?: (context: EmotionalContext, intensity: number) => void;
}

export interface LayoutAdaptation {
  type: 'reposition' | 'resize' | 'reorder' | 'emphasize' | 'simplify' | 'enhance';
  elements: string[];
  magnitude: number;
  duration: number;
  easing: string;
  reason: string;
}

export interface LayoutPrediction {
  nextLayout: string;
  confidence: number;
  alternatives: Array<{ layout: string; confidence: number }>;
  reasoning: string[];
  context: Record<string, any>;
}

export interface EmotionalContext {
  primary: string;
  secondary: string[];
  intensity: number;
  stability: number;
  triggers: string[];
}

// Advanced context-aware layout engine
export class ContextAwareLayoutEngine {
  private static userPatterns: Map<string, UserPattern[]> = new Map();
  private static emotionalProfiles: Map<string, EmotionalProfile> = new Map();
  private static layoutHistory: Map<string, LayoutHistory[]> = new Map();

  static calculateOptimalLayout(
    config: ContextAwareLayoutConfig,
    containerWidth: number,
    containerHeight: number,
    elements: LayoutElement[],
    userId?: string,
    sessionId?: string
  ): {
    positions: Map<string, Position>;
    adaptations: LayoutAdaptation[];
    predictions: LayoutPrediction[];
    emotionalContext: EmotionalContext;
  } {
    // Analyze user patterns and context
    const userPatterns = userId ? this.userPatterns.get(userId) || [] : [];
    const emotionalProfile = userId ? this.emotionalProfiles.get(userId) : undefined;
    const layoutHistory = sessionId ? this.layoutHistory.get(sessionId) || [] : [];

    // Calculate base positions
    const basePositions = this.calculateBasePositions(
      config,
      containerWidth,
      containerHeight,
      elements
    );

    // Apply user behavior adaptations
    const adaptedPositions = this.applyUserBehaviorAdaptations(
      basePositions,
      userPatterns,
      emotionalProfile,
      config
    );

    // Apply emotional context adaptations
    const emotionalPositions = this.applyEmotionalContextAdaptations(
      adaptedPositions,
      emotionalProfile,
      config
    );

    // Generate layout predictions
    const predictions = this.generateLayoutPredictions(
      elements,
      userPatterns,
      layoutHistory,
      config
    );

    // Determine emotional context
    const emotionalContext = this.analyzeEmotionalContext(
      elements,
      emotionalProfile,
      config
    );

    // Generate adaptation recommendations
    const adaptations = this.generateAdaptations(
      elements,
      userPatterns,
      emotionalProfile,
      config
    );

    return {
      positions: emotionalPositions,
      adaptations,
      predictions,
      emotionalContext,
    };
  }

  private static calculateBasePositions(
    config: ContextAwareLayoutConfig,
    containerWidth: number,
    containerHeight: number,
    elements: LayoutElement[]
  ): Map<string, Position> {
    const positions = new Map<string, Position>();
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const baseUnit = Math.min(containerWidth, containerHeight) / 12;

    elements.forEach((element, index) => {
      const angle = (index / elements.length) * Math.PI * 2;
      const radius = baseUnit * (2 + index * 0.5);
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      positions.set(element.id, {
        x: Math.max(0, Math.min(containerWidth - baseUnit * 2, x - baseUnit)),
        y: Math.max(0, Math.min(containerHeight - baseUnit * 2, y - baseUnit)),
        width: baseUnit * 2,
        height: baseUnit * 1.5,
        rotation: 0,
        scale: 1.0,
        zIndex: index + 1,
      });
    });

    return positions;
  }

  private static applyUserBehaviorAdaptations(
    positions: Map<string, Position>,
    userPatterns: UserPattern[],
    emotionalProfile: EmotionalProfile | undefined,
    config: ContextAwareLayoutConfig
  ): Map<string, Position> {
    const adaptedPositions = new Map(positions);

    // Analyze interaction patterns
    const interactionPatterns = userPatterns.filter(p => p.type === 'interaction');
    const navigationPatterns = userPatterns.filter(p => p.type === 'navigation');
    const preferencePatterns = userPatterns.filter(p => p.type === 'preference');

    // Apply interaction-based adaptations
    interactionPatterns.forEach(pattern => {
      if (pattern.confidence > 0.7) {
        const elementId = pattern.pattern.split(':')[1];
        if (elementId) {
          const position = adaptedPositions.get(elementId);
          if (position) {
            // Increase size for frequently interacted elements
            position.width *= 1.2;
            position.height *= 1.2;
            position.zIndex = Math.max(position.zIndex || 1, 10);
          }
        }
      }
    });

    // Apply navigation-based adaptations
    navigationPatterns.forEach(pattern => {
      if (pattern.confidence > 0.6) {
        const elementId = pattern.pattern.split(':')[1];
        if (elementId) {
          const position = adaptedPositions.get(elementId);
          if (position) {
            const originalPosition = positions.get(elementId);
            // Position frequently accessed elements closer to center
            position.x = (position.x + (originalPosition?.x || position.x)) * 0.8;
            position.y = (position.y + (originalPosition?.y || position.y)) * 0.8;
          }
        }
      }
    });

    // Apply preference-based adaptations
    preferencePatterns.forEach(pattern => {
      if (pattern.confidence > 0.8) {
        const elementId = pattern.pattern.split(':')[1];
        if (elementId) {
          const position = adaptedPositions.get(elementId);
          if (position) {
            // Emphasize preferred elements
            position.scale = (position.scale || 1) * 1.1;
            position.zIndex = (position.zIndex || 1) + 5;
          }
        }
      }
    });

    return adaptedPositions;
  }

  private static applyEmotionalContextAdaptations(
    positions: Map<string, Position>,
    emotionalProfile: EmotionalProfile | undefined,
    config: ContextAwareLayoutConfig
  ): Map<string, Position> {
    if (!emotionalProfile) return positions;

    const adaptedPositions = new Map(positions);

    // Adjust based on emotional state
    const stressLevel = emotionalProfile.traits['stress'] || 0.5;
    const focusLevel = emotionalProfile.traits['focus'] || 0.5;
    const energyLevel = emotionalProfile.traits['energy'] || 0.5;

    // Reduce complexity when stressed
    if (stressLevel > 0.7) {
      // Simplify layout by reducing element sizes and spacing
      adaptedPositions.forEach((position, elementId) => {
        position.width *= 0.9;
        position.height *= 0.9;
        position.scale = (position.scale || 1) * 0.95;
      });
    }

    // Increase spacing when distracted
    if (focusLevel < 0.3) {
      // Add more breathing room
      adaptedPositions.forEach((position, elementId) => {
        position.x += (Math.random() - 0.5) * 20;
        position.y += (Math.random() - 0.5) * 20;
      });
    }

    // Enhance contrast when low energy
    if (energyLevel < 0.3) {
      // Make important elements more prominent
      adaptedPositions.forEach((position, elementId) => {
        if (position.zIndex && position.zIndex > 5) {
          position.scale = (position.scale || 1) * 1.1;
          position.zIndex = (position.zIndex || 1) + 3;
        }
      });
    }

    return adaptedPositions;
  }

  private static generateLayoutPredictions(
    elements: LayoutElement[],
    userPatterns: UserPattern[],
    layoutHistory: LayoutHistory[],
    config: ContextAwareLayoutConfig
  ): LayoutPrediction[] {
    const predictions: LayoutPrediction[] = [];

    // Simple rule-based predictions
    const highConfidencePatterns = userPatterns.filter(p => p.confidence > 0.8);

    if (highConfidencePatterns.length > 0) {
      const prediction: LayoutPrediction = {
        nextLayout: 'optimized-for-user',
        confidence: highConfidencePatterns.reduce((sum, p) => sum + p.confidence, 0) / highConfidencePatterns.length,
        alternatives: [
          { layout: 'default', confidence: 0.3 },
          { layout: 'simplified', confidence: 0.2 },
          { layout: 'enhanced', confidence: 0.1 },
        ],
        reasoning: [
          'Based on user interaction patterns',
          'High confidence in user preferences',
          'Consistent behavior observed',
        ],
        context: {
          userPatterns: highConfidencePatterns.length,
          layoutHistory: layoutHistory.length,
          adaptation: config.adaptation,
        },
      };

      predictions.push(prediction);
    }

    return predictions;
  }

  private static analyzeEmotionalContext(
    elements: LayoutElement[],
    emotionalProfile: EmotionalProfile | undefined,
    config: ContextAwareLayoutConfig
  ): EmotionalContext {
    const context: EmotionalContext = {
      primary: 'neutral',
      secondary: [],
      intensity: 0.5,
      stability: 0.7,
      triggers: [],
    };

    if (!emotionalProfile) return context;

    // Analyze emotional state
    const stressLevel = emotionalProfile.traits['stress'] || 0.5;
    const anxietyLevel = emotionalProfile.traits['anxiety'] || 0.5;
    const focusLevel = emotionalProfile.traits['focus'] || 0.5;

    // Determine primary emotional context
    if (stressLevel > 0.7) {
      context.primary = 'stressed';
      context.intensity = stressLevel;
      context.triggers.push('high_cognitive_load', 'time_pressure');
    } else if (anxietyLevel > 0.6) {
      context.primary = 'anxious';
      context.intensity = anxietyLevel;
      context.triggers.push('uncertainty', 'complexity');
    } else if (focusLevel > 0.8) {
      context.primary = 'focused';
      context.intensity = focusLevel;
      context.triggers.push('clear_objectives', 'minimal_distractions');
    } else {
      context.primary = 'calm';
      context.intensity = 0.3;
    }

    // Add secondary contexts
    if (emotionalProfile.current === 'excited') {
      context.secondary.push('energetic', 'motivated');
    } else if (emotionalProfile.current === 'frustrated') {
      context.secondary.push('impatient', 'dissatisfied');
    }

    return context;
  }

  private static generateAdaptations(
    elements: LayoutElement[],
    userPatterns: UserPattern[],
    emotionalProfile: EmotionalProfile | undefined,
    config: ContextAwareLayoutConfig
  ): LayoutAdaptation[] {
    const adaptations: LayoutAdaptation[] = [];

    // Generate user behavior-based adaptations
    const highPriorityElements = elements.filter(el => el.priority === 'hero' || el.priority === 'featured');
    if (highPriorityElements.length > 0) {
      adaptations.push({
        type: 'emphasize',
        elements: highPriorityElements.map(el => el.id),
        magnitude: 0.3,
        duration: 300,
        easing: 'easeOut',
        reason: 'user_preference_indication',
      });
    }

    // Generate emotional state-based adaptations
    if (emotionalProfile?.traits && emotionalProfile.traits['stress']! > 0.7) {
      adaptations.push({
        type: 'simplify',
        elements: elements.map(el => el.id),
        magnitude: 0.2,
        duration: 500,
        easing: 'easeInOut',
        reason: 'high_stress_reduction',
      });
    }

    return adaptations;
  }

  // User pattern learning
  static learnUserPattern(
    userId: string,
    pattern: Omit<UserPattern, 'id' | 'confidence' | 'frequency' | 'recency' | 'prediction'>
  ): UserPattern {
    const userPattern: UserPattern = {
      id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      confidence: 0.5,
      frequency: 1,
      recency: Date.now(),
      prediction: {
        nextAction: 'unknown',
        probability: 0.3,
        alternatives: [],
      },
      ...pattern,
    };

    const existingPatterns = this.userPatterns.get(userId) || [];
    const similarPattern = existingPatterns.find(p =>
      p.type === pattern.type && p.pattern === pattern.pattern
    );

    if (similarPattern) {
      similarPattern.frequency++;
      similarPattern.recency = Date.now();
      similarPattern.confidence = Math.min(1.0, similarPattern.confidence + 0.1);
      return similarPattern;
    } else {
      existingPatterns.push(userPattern);
      this.userPatterns.set(userId, existingPatterns);
      return userPattern;
    }
  }
}

export interface LayoutHistory {
  id: string;
  timestamp: number;
  layout: string;
  elements: string[];
  userActions: string[];
  emotionalContext: string;
  performance: number;
}

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scale?: number;
  zIndex?: number;
}

const ContextAwareLayouts: React.FC<ContextAwareLayoutProps> = ({
  config,
  elements,
  children,
  containerWidth = 800,
  containerHeight = 600,
  userId,
  sessionId,
  enableLearning = true,
  enablePrediction = true,
  enableEmotional = true,
  className = '',
  style = {},
  onUserPattern,
  onLayoutAdaptation,
  onPrediction,
  onEmotionalContext,
}) => {
  const [positions, setPositions] = useState<Map<string, Position>>(new Map());
  const [adaptations, setAdaptations] = useState<LayoutAdaptation[]>([]);
  const [predictions, setPredictions] = useState<LayoutPrediction[]>([]);
  const [emotionalContext, setEmotionalContext] = useState<EmotionalContext>({
    primary: 'neutral',
    secondary: [],
    intensity: 0.5,
    stability: 0.7,
    triggers: [],
  });
  const [isAdapting, setIsAdapting] = useState(false);
  const [learningProgress, setLearningProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Calculate context-aware layout
  const calculateLayout = useCallback(() => {
    if (!containerRef.current) return;

    const result = ContextAwareLayoutEngine.calculateOptimalLayout(
      config,
      containerWidth,
      containerHeight,
      elements,
      userId,
      sessionId
    );

    setPositions(result.positions);
    setAdaptations(result.adaptations);
    setPredictions(result.predictions);
    setEmotionalContext(result.emotionalContext);

    // Notify parent components
    result.adaptations.forEach(adaptation => {
      onLayoutAdaptation?.(adaptation, adaptation.reason);
    });

    result.predictions.forEach(prediction => {
      onPrediction?.(prediction, prediction.confidence);
    });

    if (enableEmotional) {
      onEmotionalContext?.(result.emotionalContext, result.emotionalContext.intensity);
    }

    // Simulate learning progress
    if (enableLearning) {
      setLearningProgress(prev => Math.min(100, prev + 5));
    }

    setIsAdapting(true);
    setTimeout(() => setIsAdapting(false), 300);
  }, [
    config,
    containerWidth,
    containerHeight,
    elements,
    userId,
    sessionId,
    enableLearning,
    enableEmotional,
    onLayoutAdaptation,
    onPrediction,
    onEmotionalContext,
  ]);

  // Handle element interactions for learning
  const handleElementInteraction = useCallback((elementId: string, interactionType: string) => {
    if (!enableLearning || !userId) return;

    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    // Learn interaction pattern
    const pattern = ContextAwareLayoutEngine.learnUserPattern(userId, {
      type: 'interaction',
      pattern: `${interactionType}:${elementId}`,
      context: {
        elementPriority: element.priority,
        elementSize: element.size,
        interactionType,
        timestamp: Date.now(),
      },
    });

    onUserPattern?.(pattern);

    // Trigger adaptation based on learning
    if (pattern.confidence > 0.7) {
      const adaptation: LayoutAdaptation = {
        type: 'emphasize',
        elements: [elementId],
        magnitude: 0.2,
        duration: 200,
        easing: 'easeOut',
        reason: 'learned_user_preference',
      };
      onLayoutAdaptation?.(adaptation, 'pattern_learning');
    }
  }, [elements, enableLearning, userId, onUserPattern, onLayoutAdaptation]);

  // Responsive updates
  useEffect(() => {
    const handleResize = () => {
      calculateLayout();
    };

    // Initial calculation
    calculateLayout();

    // Set up event listeners
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateLayout]);

  return (
    <div
      ref={containerRef}
      className={`context-aware-layout-container ${className} ${isAdapting ? 'adapting' : ''}`}
      style={{
        position: 'relative',
        width: containerWidth,
        height: containerHeight,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Layout elements */}
      {elements.map((element, index) => {
        const position = positions.get(element.id);
        if (!position) return null;

        return (
          <motion.div
            key={element.id}
            className={`layout-element ${element.priority} ${element.position}`}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transformOrigin: 'center',
            }}
            animate={{
              x: position.x,
              y: position.y,
              width: position.width,
              height: position.height,
              rotate: position.rotation,
              scale: position.scale,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.5,
              ease: 'easeInOut',
              delay: index * 0.05,
            }}
            onClick={() => handleElementInteraction(element.id, 'click')}
            onMouseEnter={() => handleElementInteraction(element.id, 'hover')}
            onFocus={() => handleElementInteraction(element.id, 'focus')}
            whileHover={shouldReduceMotion ? {} : {
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
            whileTap={shouldReduceMotion ? {} : {
              scale: 0.95,
              transition: { duration: 0.1 },
            }}
          >
            {/* Element content */}
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                overflow: 'hidden',
                background: `linear-gradient(135deg,
                  ${element.priority === 'hero' ? 'rgba(139, 92, 246, 0.2)' :
                    element.priority === 'featured' ? 'rgba(59, 130, 246, 0.15)' :
                    'rgba(107, 114, 128, 0.1)'} 0%,
                  transparent 100%)`,
                border: `2px solid ${element.priority === 'hero' ? 'rgba(139, 92, 246, 0.3)' :
                  element.priority === 'featured' ? 'rgba(59, 130, 246, 0.2)' :
                  'rgba(107, 114, 128, 0.1)'}`,
                backdropFilter: 'blur(10px)',
              }}
            >
              {element.content}

              {/* Context indicator */}
              {element.context.situationalRelevance > 0.8 && (
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2px solid white',
                    boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Adaptation indicators */}
      <AnimatePresence>
        {isAdapting && adaptations.length > 0 && (
          <motion.div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              padding: '8px 12px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              borderRadius: '20px',
              fontSize: '12px',
              backdropFilter: 'blur(10px)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            Adapting: {adaptations[0]?.reason.replace(/_/g, ' ')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Learning progress indicator */}
      {enableLearning && learningProgress > 0 && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            width: '100px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
              borderRadius: '2px',
            }}
            animate={{ width: `${learningProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      )}

      {/* Emotional context indicator */}
      {enableEmotional && emotionalContext.intensity > 0.6 && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '20px',
            fontSize: '12px',
            backdropFilter: 'blur(10px)',
          }}
          animate={{
            backgroundColor: emotionalContext.primary === 'stressed' ? 'rgba(239, 68, 68, 0.8)' :
                            emotionalContext.primary === 'excited' ? 'rgba(34, 197, 94, 0.8)' :
                            'rgba(0, 0, 0, 0.7)',
          }}
        >
          {emotionalContext.primary} ({Math.round(emotionalContext.intensity * 100)}%)
        </motion.div>
      )}

      {/* Development info */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="absolute top-4 left-4 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded"
          style={{ fontSize: '10px' }}
        >
          {config.name} • {config.adaptation} • {elements.length} elements
        </div>
      )}

      {children}
    </div>
  );
};

// Preset context-aware layout configurations
export const DashboardContextAwareLayout: React.FC<Omit<ContextAwareLayoutProps, 'config'>> = (props) => (
  <ContextAwareLayouts
    {...props}
    config={{
      id: 'dashboard-context-aware',
      name: 'Dashboard Context-Aware Layout',
      description: 'Intelligent dashboard layout that adapts to user behavior',
      category: 'dashboard',
      adaptation: 'intelligent',
      learning: 'active',
      behavior: 'personalized',
      prediction: 'hybrid',
      memory: 'persistent',
      userModel: {
        experience: 'adaptive',
        preferences: {},
        patterns: [],
        emotionalProfile: {
          baseline: 'focused',
          current: 'focused',
          traits: { stress: 0.3, focus: 0.8, energy: 0.7 },
          triggers: [],
          coping: ['break_reminders', 'simplified_ui'],
        },
        cognitiveLoad: 'medium',
      },
      contextFactors: {
        timeOfDay: true,
        dayOfWeek: true,
        deviceType: true,
        activity: true,
        urgency: true,
      },
    }}
  />
);

export const WorkspaceContextAwareLayout: React.FC<Omit<ContextAwareLayoutProps, 'config'>> = (props) => (
  <ContextAwareLayouts
    {...props}
    config={{
      id: 'workspace-context-aware',
      name: 'Workspace Context-Aware Layout',
      description: 'Collaborative workspace layout with emotional intelligence',
      category: 'workspace',
      adaptation: 'emotional',
      learning: 'active',
      behavior: 'contextual',
      prediction: 'neural',
      memory: 'contextual',
      userModel: {
        experience: 'adaptive',
        preferences: {},
        patterns: [],
        emotionalProfile: {
          baseline: 'creative',
          current: 'focused',
          traits: { stress: 0.4, creativity: 0.8, collaboration: 0.7 },
          triggers: ['deadlines', 'complexity'],
          coping: ['team_support', 'clear_milestones'],
        },
        cognitiveLoad: 'adaptive',
      },
      contextFactors: {
        timeOfDay: true,
        activity: true,
        mood: true,
        urgency: true,
        complexity: true,
      },
    }}
  />
);

export const ContentContextAwareLayout: React.FC<Omit<ContextAwareLayoutProps, 'config'>> = (props) => (
  <ContextAwareLayouts
    {...props}
    config={{
      id: 'content-context-aware',
      name: 'Content Context-Aware Layout',
      description: 'Reading-optimized layout with cognitive load management',
      category: 'content',
      adaptation: 'predictive',
      learning: 'supervised',
      behavior: 'balanced',
      prediction: 'statistical',
      memory: 'session',
      userModel: {
        experience: 'adaptive',
        preferences: {},
        patterns: [],
        emotionalProfile: {
          baseline: 'analytical',
          current: 'focused',
          traits: { focus: 0.9, comprehension: 0.8, retention: 0.7 },
          triggers: ['complexity', 'length'],
          coping: ['summaries', 'progress_indicators'],
        },
        cognitiveLoad: 'low',
      },
      contextFactors: {
        timeOfDay: true,
        activity: true,
        complexity: true,
      },
    }}
  />
);

export default ContextAwareLayouts;