/**
 * Emotional Animations Library
 * Based on mobile-sync-proposal.md specifications
 */

import { Animated, Easing } from 'react-native';

export interface AnimationConfig {
  duration: number;
  easing?: (value: number) => number;
  useNativeDriver?: boolean;
}

export interface AnimationSequence {
  animations: Animated.CompositeAnimation[];
  duration: number;
}

export class EmotionalAnimations {
  // Success celebration (document upload, milestone)
  static successBurst(
    scaleValue: Animated.Value,
    opacityValue: Animated.Value,
    config?: Partial<AnimationConfig>
  ): AnimationSequence {
    const defaultConfig = {
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      ...config,
    };

    const animations = [
      // Scale burst: 0 -> 1.2 -> 1
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: defaultConfig.duration * 0.4,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: defaultConfig.useNativeDriver,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: defaultConfig.duration * 0.6,
          easing: defaultConfig.easing,
          useNativeDriver: defaultConfig.useNativeDriver,
        }),
      ]),
      // Opacity: 0 -> 1 -> 0.8
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: defaultConfig.duration * 0.3,
          easing: defaultConfig.easing,
          useNativeDriver: defaultConfig.useNativeDriver,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.8,
          duration: defaultConfig.duration * 0.7,
          easing: defaultConfig.easing,
          useNativeDriver: defaultConfig.useNativeDriver,
        }),
      ]),
    ];

    return {
      animations,
      duration: defaultConfig.duration,
    };
  }

  // Comfort animation (error states, empty states)
  static comfortFade(
    translateYValue: Animated.Value,
    opacityValue: Animated.Value,
    config?: Partial<AnimationConfig>
  ): AnimationSequence {
    const defaultConfig = {
      duration: 800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
      ...config,
    };

    const animations = [
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: defaultConfig.duration,
          easing: defaultConfig.easing,
          useNativeDriver: defaultConfig.useNativeDriver,
        }),
        Animated.timing(translateYValue, {
          toValue: 0,
          duration: defaultConfig.duration,
          easing: defaultConfig.easing,
          useNativeDriver: defaultConfig.useNativeDriver,
        }),
      ]),
    ];

    return {
      animations,
      duration: defaultConfig.duration,
    };
  }

  // Guidance animation (Sofia suggestions)
  static guidancePulse(
    scaleValue: Animated.Value,
    opacityValue: Animated.Value,
    config?: Partial<AnimationConfig>
  ): Animated.CompositeAnimation {
    const defaultConfig = {
      duration: 2000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
      ...config,
    };

    return Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.05,
            duration: defaultConfig.duration / 2,
            easing: defaultConfig.easing,
            useNativeDriver: defaultConfig.useNativeDriver,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: defaultConfig.duration / 2,
            easing: defaultConfig.easing,
            useNativeDriver: defaultConfig.useNativeDriver,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: defaultConfig.duration / 2,
            easing: defaultConfig.easing,
            useNativeDriver: defaultConfig.useNativeDriver,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.7,
            duration: defaultConfig.duration / 2,
            easing: defaultConfig.easing,
            useNativeDriver: defaultConfig.useNativeDriver,
          }),
        ]),
      ])
    );
  }

  // Achievement unlock (milestones)
  static achievementShine(
    rotateValue: Animated.Value,
    opacityValue: Animated.Value,
    config?: Partial<AnimationConfig>
  ): AnimationSequence {
    const defaultConfig = {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      ...config,
    };

    const animations = [
      Animated.parallel([
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: defaultConfig.duration,
          easing: defaultConfig.easing,
          useNativeDriver: defaultConfig.useNativeDriver,
        }),
        Animated.sequence([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: defaultConfig.duration * 0.3,
            easing: defaultConfig.easing,
            useNativeDriver: defaultConfig.useNativeDriver,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.8,
            duration: defaultConfig.duration * 0.7,
            easing: defaultConfig.easing,
            useNativeDriver: defaultConfig.useNativeDriver,
          }),
        ]),
      ]),
    ];

    return {
      animations,
      duration: defaultConfig.duration,
    };
  }

  // Gentle entrance animation
  static gentleEntrance(
    scaleValue: Animated.Value,
    opacityValue: Animated.Value,
    config?: Partial<AnimationConfig>
  ): AnimationSequence {
    const defaultConfig = {
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
      ...config,
    };

    const animations = [
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: defaultConfig.duration,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: defaultConfig.useNativeDriver,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: defaultConfig.duration,
          easing: defaultConfig.easing,
          useNativeDriver: defaultConfig.useNativeDriver,
        }),
      ]),
    ];

    return {
      animations,
      duration: defaultConfig.duration,
    };
  }

  // Helper method to run animation sequence
  static runSequence(sequence: AnimationSequence, callback?: () => void): void {
    if (sequence && sequence.animations) {
      Animated.parallel(sequence.animations).start(callback);
    }
  }

  // Helper method to create animated value with initial state
  static createAnimatedValue(initialValue: number = 0): Animated.Value {
    return new Animated.Value(initialValue);
  }

  // Helper method to reset animation values
  static resetValues(values: { [key: string]: Animated.Value }, initialStates: { [key: string]: number }): void {
    Object.keys(values).forEach(key => {
      const value = values[key];
      if (value) {
        value.setValue(initialStates[key] || 0);
      }
    });
  }
}