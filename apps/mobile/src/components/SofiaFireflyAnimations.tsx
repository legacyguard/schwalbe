import * as React from 'react';
import { useMemo } from 'react';
import { Animated } from 'react-native';

interface AnimationConfig {
  duration: number;
  easing?: (value: number) => number;
  useNativeDriver: boolean;
}

interface PersonalityAnimationConfig {
  float: AnimationConfig;
  pulse: AnimationConfig;
  wing: AnimationConfig;
  touch: AnimationConfig;
  opacityRange: [number, number];
}

export const useSofiaAnimations = (
  personality: 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting',
  context: 'idle' | 'guiding' | 'celebrating' | 'helping' | 'waiting'
) => {
  const animationConfigs = useMemo((): PersonalityAnimationConfig => {
    const baseConfigs = {
      empathetic: {
        float: { duration: 4000, useNativeDriver: true },
        pulse: { duration: 2500, useNativeDriver: true },
        wing: { duration: 200, useNativeDriver: true },
        touch: { duration: 200, useNativeDriver: true },
        opacityRange: [0.6, 0.9] as [number, number],
      },
      pragmatic: {
        float: { duration: 3000, useNativeDriver: true },
        pulse: { duration: 1800, useNativeDriver: true },
        wing: { duration: 150, useNativeDriver: true },
        touch: { duration: 150, useNativeDriver: true },
        opacityRange: [0.7, 1.0] as [number, number],
      },
      celebratory: {
        float: { duration: 2000, useNativeDriver: true },
        pulse: { duration: 1200, useNativeDriver: true },
        wing: { duration: 100, useNativeDriver: true },
        touch: { duration: 150, useNativeDriver: true },
        opacityRange: [0.8, 1.0] as [number, number],
      },
      comforting: {
        float: { duration: 5000, useNativeDriver: true },
        pulse: { duration: 3000, useNativeDriver: true },
        wing: { duration: 250, useNativeDriver: true },
        touch: { duration: 300, useNativeDriver: true },
        opacityRange: [0.5, 0.8] as [number, number],
      },
    };

    return baseConfigs[personality] || baseConfigs.empathetic;
  }, [personality]);

  const contextMultipliers = useMemo(() => {
    const multipliers = {
      idle: 1.0,
      guiding: 1.1,
      celebrating: 1.3,
      helping: 1.2,
      waiting: 0.8,
    };
    return multipliers[context] || 1.0;
  }, [context]);

  return {
    animationConfigs,
    contextMultipliers,
  };
};

export const createFloatingAnimation = (
  animatedValue: Animated.Value,
  config: AnimationConfig,
  contextMultiplier: number = 1.0
) => {
  const adjustedConfig = {
    ...config,
    duration: config.duration * contextMultiplier,
  };

  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        ...adjustedConfig,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        ...adjustedConfig,
      }),
    ])
  );
};

export const createPulseAnimation = (
  opacityValue: Animated.Value,
  opacityRange: [number, number],
  config: AnimationConfig,
  contextMultiplier: number = 1.0
) => {
  const adjustedConfig = {
    ...config,
    duration: config.duration * contextMultiplier,
  };

  return Animated.loop(
    Animated.sequence([
      Animated.timing(opacityValue, {
        toValue: opacityRange[1],
        ...adjustedConfig,
      }),
      Animated.timing(opacityValue, {
        toValue: opacityRange[0],
        ...adjustedConfig,
      }),
    ])
  );
};

export const createWingAnimation = (
  wingRotation: Animated.Value,
  config: AnimationConfig,
  contextMultiplier: number = 1.0
) => {
  const adjustedConfig = {
    ...config,
    duration: config.duration * contextMultiplier,
  };

  return Animated.loop(
    Animated.sequence([
      Animated.timing(wingRotation, {
        toValue: 1,
        ...adjustedConfig,
      }),
      Animated.timing(wingRotation, {
        toValue: 0,
        ...adjustedConfig,
      }),
    ])
  );
};

export const createTouchAnimation = (
  scaleValue: Animated.Value,
  config: AnimationConfig
) => {
  return Animated.sequence([
    Animated.timing(scaleValue, {
      toValue: 1.4,
      ...config,
    }),
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: config.duration * 1.5,
      useNativeDriver: config.useNativeDriver,
    }),
  ]);
};

// Advanced easing functions
export const EasingPresets = {
  gentle: (t: number) => t * t * (3 - 2 * t), // smoothstep
  bouncy: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  elastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  swift: (t: number) => 1 - Math.pow(1 - t, 3), // easeOutCubic
};

export default {
  useSofiaAnimations,
  createFloatingAnimation,
  createPulseAnimation,
  createWingAnimation,
  createTouchAnimation,
  EasingPresets,
};