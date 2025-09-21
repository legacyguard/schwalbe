import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, useAnimation, useMotionValue, PanInfo } from 'framer-motion';
import { SofiaFireflySVG } from './SofiaFireflySVG';
import { useSofiaAnimations } from './SofiaFireflyAnimations';
import { useSofiaPersonality, PersonalityState } from './SofiaFireflyPersonality';
import { useSofiaAccessibility } from './SofiaFireflyAccessibility';
import { useSofiaPerformance } from './SofiaFireflyPerformance';
import { emotionalColors } from '../../shared/theme/colors';

export interface SofiaFireflyProps {
  // Core props
  onTouch?: () => void;
  isActive?: boolean;
  size?: 'mini' | 'small' | 'medium' | 'large' | 'hero';
  message?: string;

  // Enhanced props
  variant?: 'floating' | 'interactive' | 'contextual';
  personality?: 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting' | 'nurturing' | 'confident';
  context?: 'idle' | 'guiding' | 'celebrating' | 'helping' | 'waiting' | 'learning' | 'supporting' | 'encouraging';

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;

  // Performance
  enableHaptics?: boolean;
  enableAdvancedAnimations?: boolean;

  // Visual customization
  glowIntensity?: number;
  className?: string;
}

export const SofiaFirefly: React.FC<SofiaFireflyProps> = ({
  onTouch,
  isActive = true,
  size = 'medium',
  message = "Sofia's light guides your path",
  variant = 'floating',
  personality = 'empathetic',
  context = 'idle',
  accessibilityLabel = "Sofia, your AI assistant",
  accessibilityHint = "Click to interact with Sofia",
  enableHaptics = true,
  enableAdvancedAnimations = true,
  glowIntensity = 0.3,
  className = '',
}) => {
  // Animation controls
  const controls = useAnimation();
  const glowControls = useAnimation();

  // Motion values for interactive variant
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // State
  const [showMessage, setShowMessage] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Personality system
  const initialPersonalityState: PersonalityState = {
    mode: personality,
    confidence: 0.8,
    context: context,
    mood: 'neutral' as const,
    interactionCount: 0,
  };

  const {
    personality: currentPersonalityState,
    learnFromInteraction,
    getContextualMessage,
    adaptToContext,
  } = useSofiaPersonality(initialPersonalityState);

  // Accessibility system
  const accessibilityConfig = useSofiaAccessibility();

  // Performance system
  const {
    config: performanceConfig,
    debounce,
    monitorPerformance,
    cleanupAnimation,
  } = useSofiaPerformance();

  // Size configuration
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'mini': return { size: 16, fontSize: 10, glowSize: 32 };
      case 'small': return { size: 24, fontSize: 14, glowSize: 48 };
      case 'large': return { size: 48, fontSize: 28, glowSize: 96 };
      case 'hero': return { size: 64, fontSize: 36, glowSize: 128 };
      default: return { size: 32, fontSize: 18, glowSize: 64 };
    }
  }, [size]);

  const fireflySize = sizeConfig.size;
  const glowSize = sizeConfig.glowSize;

  // Animation system
  const { animationConfigs, contextMultipliers } = useSofiaAnimations(
    currentPersonalityState.mode,
    currentPersonalityState.context
  );

  // Context-based behavior
  const contextBehavior = useMemo(() => {
    const behaviors = {
      idle: { message: message, animation: 'gentle' },
      guiding: { message: "I'm here to help you navigate", animation: 'focused' },
      celebrating: { message: "Amazing progress! 🎉", animation: 'energetic' },
      helping: { message: "Let me assist you with that", animation: 'attentive' },
      waiting: { message: "Take your time, I'm here", animation: 'patient' },
      learning: { message: "I'm learning how to best support you", animation: 'curious' },
      supporting: { message: "I'm here to support you through this", animation: 'comforting' },
      encouraging: { message: "You've got this! Keep going!", animation: 'motivational' },
    };
    return behaviors[context] || behaviors.idle;
  }, [context, message]);

  // Enhanced floating animation with personality
  const startFloatingAnimation = useCallback(async () => {
    if (!enableAdvancedAnimations || accessibilityConfig.reducedMotion) return;

    const { float, pulse } = animationConfigs;

    // Start floating animation
    await controls.start({
      y: [-10, 10, -10],
      transition: {
        duration: float.duration * contextMultipliers.float,
        repeat: Infinity,
        ease: float.easing,
      },
    });

    // Start pulse animation for glow
    await glowControls.start({
      scale: [1, 1.2, 1],
      opacity: [glowIntensity, glowIntensity * 1.5, glowIntensity],
      transition: {
        duration: pulse.duration * contextMultipliers.pulse,
        repeat: Infinity,
        ease: pulse.easing,
      },
    });
  }, [enableAdvancedAnimations, animationConfigs, contextMultipliers, controls, glowControls, glowIntensity, accessibilityConfig.reducedMotion]);

  // Enhanced touch interaction with performance monitoring
  const handleInteraction = useCallback(async (event: React.MouseEvent | React.TouchEvent) => {
    const startTime = performance.now();

    // Stop previous animations
    controls.stop();
    glowControls.stop();

    // Enhanced haptic feedback (visual feedback for web)
    if (enableHaptics) {
      // Web haptic feedback through animation
      await controls.start({
        scale: [1, 1.3, 1],
        transition: { duration: 0.3, ease: "easeOut" }
      });
    }

    // Show contextual message
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2500);

    // Learn from interaction
    learnFromInteraction({
      type: 'click',
      duration: 200,
      context: context,
    });

    onTouch?.();

    // Performance monitoring
    monitorPerformance('handleInteraction', startTime);
  }, [enableHaptics, controls, glowControls, learnFromInteraction, context, onTouch, monitorPerformance]);

  // Pan/drag handlers for interactive variant
  const handleDragStart = useCallback(() => {
    setIsInteracting(true);
  }, []);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    setIsInteracting(false);
    // Reset position after drag
    setTimeout(() => {
      x.set(0);
      y.set(0);
    }, 2000);
  }, [x, y]);

  // Start animations on mount
  useEffect(() => {
    if (isActive && enableAdvancedAnimations) {
      startFloatingAnimation();
    }
    return () => {
      cleanupAnimation(controls);
      cleanupAnimation(glowControls);
    };
  }, [isActive, enableAdvancedAnimations, startFloatingAnimation, cleanupAnimation, controls, glowControls]);

  // Update personality when prop changes
  useEffect(() => {
    adaptToContext(context);
  }, [context, adaptToContext]);

  if (!isActive) return null;

  const renderFireflyBody = () => (
    <SofiaFireflySVG
      size={fireflySize}
      personality={currentPersonalityState.mode}
      context={currentPersonalityState.context}
      glowIntensity={glowIntensity}
      wingAnimation={0} // Will be enhanced in Phase 3
    />
  );

  const renderInteractiveFirefly = () => (
    <motion.div
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      dragElastic={0.1}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ x, y }}
      whileDrag={{ scale: 1.1 }}
      className="relative"
    >
      {/* Glow effect */}
      <motion.div
        animate={glowControls}
        className="absolute rounded-full"
        style={{
          width: glowSize,
          height: glowSize,
          backgroundColor: `rgba(251, 191, 36, ${glowIntensity})`,
          top: -glowSize / 2 + fireflySize / 2,
          left: -glowSize / 2 + fireflySize / 2,
        }}
      />

      {/* Firefly body */}
      {renderFireflyBody()}
    </motion.div>
  );

  const renderFloatingFirefly = () => (
    <motion.div
      animate={controls}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleInteraction}
      className="relative cursor-pointer"
    >
      {/* Glow effect */}
      <motion.div
        animate={glowControls}
        className="absolute rounded-full"
        style={{
          width: glowSize,
          height: glowSize,
          backgroundColor: `rgba(251, 191, 36, ${glowIntensity})`,
          top: -glowSize / 2 + fireflySize / 2,
          left: -glowSize / 2 + fireflySize / 2,
        }}
      />

      {/* Firefly body */}
      {renderFireflyBody()}
    </motion.div>
  );

  return (
    <div className={`relative flex items-center ${className}`}>
      <div
        role="button"
        tabIndex={0}
        aria-label={getContextualMessage(accessibilityLabel)}
        aria-describedby={showMessage ? "sofia-message" : undefined}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleInteraction(e as any);
          }
        }}
        className="focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded-full"
      >
        {variant === 'interactive' ? renderInteractiveFirefly() : renderFloatingFirefly()}
      </div>

      {/* Contextual message */}
      {showMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div
            id="sofia-message"
            className="bg-slate-800 border border-yellow-400 border-opacity-50 rounded-lg px-3 py-2 max-w-xs text-center shadow-lg"
          >
            <p className="text-yellow-400 text-sm font-medium">
              {getContextualMessage(contextBehavior.message)}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SofiaFirefly;