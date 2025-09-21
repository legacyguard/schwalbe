/**
 * Emotional Animation Wrapper Component
 * Provides easy-to-use wrapper for emotional animations
 */

import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { EmotionalAnimations } from '../../utils/emotionalAnimations';

type AnimationType = 'successBurst' | 'comfortFade' | 'guidancePulse' | 'achievementShine' | 'gentleEntrance';

export interface EmotionalAnimationWrapperProps {
  children: React.ReactNode;
  animationType: AnimationType;
  trigger?: boolean;
  loop?: boolean;
  onAnimationComplete?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const EmotionalAnimationWrapper: React.FC<EmotionalAnimationWrapperProps> = React.memo(({
  children,
  animationType,
  trigger = false,
  loop = false,
  onAnimationComplete,
  style,
  disabled = false,
}) => {
  const scaleValue = useRef(new Animated.Value(animationType === 'comfortFade' ? 1 : 0)).current;
  const opacityValue = useRef(new Animated.Value(animationType === 'comfortFade' ? 0 : 1)).current;
  const translateYValue = useRef(new Animated.Value(animationType === 'comfortFade' ? 20 : 0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startAnimation = () => {
    if (disabled) return;

    // Stop any running animation and timeout
    currentAnimation.current?.stop();
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
    }

    switch (animationType) {
      case 'successBurst': {
        const sequence = EmotionalAnimations.successBurst(scaleValue, opacityValue);
        currentAnimation.current = Animated.parallel(sequence.animations);
        break;
      }
      case 'comfortFade': {
        const sequence = EmotionalAnimations.comfortFade(translateYValue, opacityValue);
        currentAnimation.current = Animated.parallel(sequence.animations);
        break;
      }
      case 'guidancePulse': {
        currentAnimation.current = EmotionalAnimations.guidancePulse(scaleValue, opacityValue);
        break;
      }
      case 'achievementShine': {
        const sequence = EmotionalAnimations.achievementShine(rotateValue, opacityValue);
        currentAnimation.current = Animated.parallel(sequence.animations);
        break;
      }
      case 'gentleEntrance': {
        const sequence = EmotionalAnimations.gentleEntrance(scaleValue, opacityValue);
        currentAnimation.current = Animated.parallel(sequence.animations);
        break;
      }
    }

    if (currentAnimation.current) {
      currentAnimation.current.start(({ finished }) => {
        if (finished) {
          onAnimationComplete?.();
          if (loop && animationType !== 'guidancePulse') {
            // Restart animation for non-looping types
            loopTimeoutRef.current = setTimeout(startAnimation, 500);
          }
        }
      });
    }
  };

  useEffect(() => {
    if (trigger) {
      startAnimation();
    }
  }, [trigger]);

  useEffect(() => {
    // Start guidance pulse immediately if that's the type
    if (animationType === 'guidancePulse') {
      startAnimation();
    }

    // Cleanup on unmount
    return () => {
      currentAnimation.current?.stop();
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
    };
  }, []);

  const getAnimatedStyle = () => {
    const baseStyle: {
      transform: any[];
      opacity: any;
    } = {
      transform: [],
      opacity: opacityValue,
    };

    switch (animationType) {
      case 'successBurst':
      case 'gentleEntrance':
      case 'guidancePulse':
        baseStyle.transform.push({ scale: scaleValue });
        break;
      case 'comfortFade':
        baseStyle.transform.push({ translateY: translateYValue });
        break;
      case 'achievementShine':
        baseStyle.transform.push(
          { scale: scaleValue },
          {
            rotate: rotateValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['-180deg', '0deg'],
            })
          }
        );
        break;
    }

    return baseStyle;
  };

  return (
    <Animated.View style={[getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
});