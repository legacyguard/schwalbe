import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Animated, Pressable, Dimensions, PanResponder, Vibration, Platform } from 'react-native';
import { YStack, Text } from 'tamagui';
import { emotionalColors } from '../temp-emotional-sync/theme/colors';
import { SofiaFireflySVG } from './SofiaFireflySVG';
import {
  useSofiaAnimations,
  createFloatingAnimation,
  createPulseAnimation,
  createWingAnimation,
  createTouchAnimation,
} from './SofiaFireflyAnimations';
import {
  useSofiaPersonality,
  PersonalityPresets,
  type PersonalityState,
} from './SofiaFireflyPersonality';
import {
  useSofiaAccessibility,
  getAccessibilityAnnouncement,
  getHapticPattern,
} from './SofiaFireflyAccessibility';
import {
  useSofiaPerformance,
} from './SofiaFireflyPerformance';

const { width, height } = Dimensions.get('window');

// Enhanced SofiaFirefly with consolidated features from both implementations
interface SofiaFireflyProps {
  // Core props
  onTouch?: () => void;
  isActive?: boolean;
  size?: 'mini' | 'small' | 'medium' | 'large' | 'hero';
  message?: string;

  // Enhanced props
  variant?: 'floating' | 'interactive' | 'contextual';
  personality?: 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting';
  context?: 'idle' | 'guiding' | 'celebrating' | 'helping' | 'waiting';

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;

  // Performance
  enableHaptics?: boolean;
  enableAdvancedAnimations?: boolean;

  // Visual customization
  glowIntensity?: number;
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
  accessibilityHint = "Touch and move around the screen to interact with Sofia",
  enableHaptics = true,
  enableAdvancedAnimations = true,
  glowIntensity = 0.3,
}) => {
  // Animation refs
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0.7)).current;
  const wingRotation = useRef(new Animated.Value(0)).current;
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // State
  const [showMessage, setShowMessage] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Personality system
  const initialPersonalityState: PersonalityState = {
    mode: personality,
    confidence: 0.8,
    context: context,
    mood: 'neutral',
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
    performanceConfig,
    debounce,
    monitorPerformance,
    cleanupAnimation,
    cleanupTimeout,
  } = useSofiaPerformance();

  // Cleanup refs
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const wingAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

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

  // Enhanced animation system
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
    };
    return behaviors[context] || behaviors.idle;
  }, [context, message]);

  // Enhanced floating animation with personality
  const startFloatingAnimation = useCallback(() => {
    if (!enableAdvancedAnimations || accessibilityConfig.reducedMotion) return;

    const floatAnimation = createFloatingAnimation(
      animatedValue,
      animationConfigs.float,
      contextMultipliers
    );

    const pulseAnimation = createPulseAnimation(
      opacityValue,
      animationConfigs.opacityRange,
      animationConfigs.pulse,
      contextMultipliers
    );

    floatAnimation.start();
    pulseAnimation.start();

    return { float: floatAnimation, pulse: pulseAnimation };
  }, [enableAdvancedAnimations, animationConfigs, contextMultipliers, animatedValue, opacityValue]);

  // Enhanced wing animation
  const startWingAnimation = useCallback(() => {
    if (!enableAdvancedAnimations || accessibilityConfig.reducedMotion) return;

    const wingAnimation = createWingAnimation(
      wingRotation,
      animationConfigs.wing,
      contextMultipliers
    );

    wingAnimation.start();
    wingAnimationRef.current = wingAnimation;
    return wingAnimation;
  }, [enableAdvancedAnimations, animationConfigs, contextMultipliers, wingRotation]);

  // Stop wing animation
  const stopWingAnimation = useCallback(() => {
    if (wingAnimationRef.current) {
      wingAnimationRef.current.stop();
      wingAnimationRef.current = null;
    }
    wingRotation.setValue(0);
  }, [wingRotation]);

  // Enhanced touch interaction with performance monitoring
  const handleInteraction = useCallback((event: any) => {
    const startTime = performance.now();
    // Clean up previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Stop previous touch animation
    if (touchAnimationRef.current) {
      touchAnimationRef.current.stop();
    }

    // Enhanced haptic feedback
    if (enableHaptics && Platform.OS !== 'web') {
      try {
        const hapticPattern = getHapticPattern(
          currentPersonalityState.context,
          currentPersonalityState.mode,
          'medium'
        );
        Vibration.vibrate(hapticPattern);
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }

    // Touch animation sequence
    touchAnimationRef.current = Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    touchAnimationRef.current.start();

    // Show contextual message
    setShowMessage(true);
    timeoutRef.current = setTimeout(() => setShowMessage(false), 2500);

    // Learn from interaction
    learnFromInteraction({
      type: 'tap',
      duration: 200,
      context: context,
    });

    onTouch?.();

    // Performance monitoring
    monitorPerformance('handleInteraction', startTime);
  }, [enableHaptics, scaleValue, onTouch]);

  // PanResponder for interactive variant
  const panResponder = useMemo(() => {
    if (variant !== 'interactive') return null;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        setIsInteracting(true);
        startWingAnimation();

        position.setValue({
          x: evt.nativeEvent.locationX - fireflySize / 2,
          y: evt.nativeEvent.locationY - fireflySize / 2,
        });

        Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },

      onPanResponderMove: (evt) => {
        position.setValue({
          x: evt.nativeEvent.locationX - fireflySize / 2,
          y: evt.nativeEvent.locationY - fireflySize / 2,
        });
      },

      onPanResponderRelease: () => {
        setIsInteracting(false);
        stopWingAnimation();

        Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: animationConfigs.opacityRange[0],
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();

        setTimeout(() => {
          position.setValue({ x: 0, y: 0 });
        }, 2000);
      },
    });
  }, [variant, fireflySize, startWingAnimation, stopWingAnimation, opacityValue, scaleValue, position, animationConfigs]);

  // Interpolations
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 12, 0],
  });

  const wingRotationInterpolate = wingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '20deg'],
  });

  // Start animations on mount
  useEffect(() => {
    if (isActive && enableAdvancedAnimations) {
      const animations = startFloatingAnimation();
      return () => {
        animations?.float?.stop();
        animations?.pulse?.stop();
      };
    }
    return undefined;
  }, [isActive, enableAdvancedAnimations, startFloatingAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (touchAnimationRef.current) {
        touchAnimationRef.current.stop();
      }
      stopWingAnimation();
    };
  }, [stopWingAnimation]);

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
    <Animated.View
      style={[
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { scale: scaleValue },
          ],
          opacity: opacityValue,
        },
      ]}
    >
      {/* Glow effect */}
      <Animated.View
        style={{
          position: 'absolute',
          width: glowSize,
          height: glowSize,
          borderRadius: glowSize / 2,
          backgroundColor: `rgba(251, 191, 36, ${glowIntensity})`,
          top: -glowSize / 2 + fireflySize / 2,
          left: -glowSize / 2 + fireflySize / 2,
        }}
      />

      {/* Firefly body */}
      {renderFireflyBody()}

      {/* Animated wings */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 2,
          left: -4,
          width: 8,
          height: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: 4,
          transform: [{ rotate: wingRotationInterpolate }],
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          top: 2,
          right: -4,
          width: 8,
          height: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: 4,
          transform: [{ rotate: wingRotationInterpolate }],
        }}
      />
    </Animated.View>
  );

  const renderFloatingFirefly = () => (
    <Pressable onPress={handleInteraction}>
      <Animated.View
        style={{
          transform: [
            { translateY },
            { translateX },
            { scale: scaleValue },
          ],
          opacity: opacityValue,
        }}
      >
        {/* Glow effect */}
        <Animated.View
          style={{
            position: 'absolute',
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            backgroundColor: `rgba(251, 191, 36, ${glowIntensity})`,
            top: -glowSize / 2 + fireflySize / 2,
            left: -glowSize / 2 + fireflySize / 2,
          }}
        />

        {renderFireflyBody()}

        {/* Animated wings */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 2,
            left: -4,
            width: 8,
            height: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: 4,
            transform: [{ rotate: wingRotationInterpolate }],
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            top: 2,
            right: -4,
            width: 8,
            height: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: 4,
            transform: [{ rotate: wingRotationInterpolate }],
          }}
        />
      </Animated.View>
    </Pressable>
  );

  return (
    <YStack position="relative" alignItems="center">
      <Animated.View
        {...(panResponder?.panHandlers || {})}
        accessibilityLabel={getAccessibilityAnnouncement(
          currentPersonalityState.context,
          currentPersonalityState.mode,
          'appeared'
        )}
        accessibilityHint={`Touch and move to interact with Sofia. ${getContextualMessage('Current context: ' + currentPersonalityState.context)}`}
        accessibilityRole="button"
        accessible={true}
        accessibilityState={{
          disabled: !isActive,
          selected: isInteracting,
        }}
      >
        {variant === 'interactive' ? renderInteractiveFirefly() : renderFloatingFirefly()}
      </Animated.View>

      {/* Contextual message */}
      {showMessage && (
        <Animated.View
          style={{
            position: 'absolute',
            top: fireflySize + 15,
            opacity: opacityValue,
          }}
        >
          <YStack
            backgroundColor={emotionalColors.backgroundSecondary}
            borderColor={emotionalColors.accentYellow}
            borderWidth={1}
            borderRadius={8}
            padding={8}
            maxWidth={220}
            alignItems="center"
          >
            <Text
              color={emotionalColors.accentYellow}
              fontSize={12}
              fontWeight="500"
              textAlign="center"
            >
              {getContextualMessage(contextBehavior.message)}
            </Text>
          </YStack>
        </Animated.View>
      )}
    </YStack>
  );
};

export default SofiaFirefly;