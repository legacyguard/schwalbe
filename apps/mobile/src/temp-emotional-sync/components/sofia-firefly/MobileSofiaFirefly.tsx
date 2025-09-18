/**
 * Mobile Sofia Firefly Component
 * Touch-based interactive firefly with haptic feedback
 * Based on mobile-sync-proposal.md implementation
 */

import React, { useState, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Vibration,
  StyleSheet,
  View,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState
} from 'react-native';
import { emotionalColors } from '../../theme/colors';

// Conditional accessibility import
const getAccessibilityProps = async () => {
  try {
    const module = await import('../../../config/accessibility');
    return module.getAccessibilityProps;
  } catch {
    return () => ({});
  }
};

export interface MobileSofiaFireflyProps {
  isEnabled?: boolean;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  size?: number;
  glowIntensity?: number;
}

export const MobileSofiaFirefly: React.FC<MobileSofiaFireflyProps> = ({
  isEnabled = true,
  onInteractionStart,
  onInteractionEnd,
  size = 24,
  glowIntensity = 0.3,
}) => {
  const [isActive, setIsActive] = useState(false);
  const fireflyPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const opacity = useRef(new Animated.Value(0.3)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const wingRotation = useRef(new Animated.Value(0)).current;

  // Animation for wing flutter
  const startWingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(wingRotation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(wingRotation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Stop wing animation
  const stopWingAnimation = () => {
    wingRotation.stopAnimation();
    wingRotation.setValue(0);
  };

  const panResponder: PanResponderInstance = PanResponder.create({
    onStartShouldSetPanResponder: () => isEnabled,
    onMoveShouldSetPanResponder: () => isEnabled,

    onPanResponderGrant: (evt: GestureResponderEvent) => {
      if (!isEnabled) return;

      // Sofia appears with gentle haptic feedback
      setIsActive(true);
      onInteractionStart?.();

      // Gentle vibration (10ms)
      Vibration.vibrate(10);

      // Update position
      fireflyPosition.setValue({
        x: evt.nativeEvent.locationX - size / 2,
        y: evt.nativeEvent.locationY - size / 2,
      });

      // Animate appearance
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      startWingAnimation();
    },

    onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      if (!isEnabled || !isActive) return;

      // Sofia follows finger movement smoothly
      fireflyPosition.setValue({
        x: gestureState.moveX - size / 2,
        y: gestureState.moveY - size / 2,
      });
    },

    onPanResponderRelease: () => {
      if (!isEnabled) return;

      // Sofia gently fades after interaction
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      stopWingAnimation();

      // Hide Sofia after 2 seconds
      setTimeout(() => {
        setIsActive(false);
        onInteractionEnd?.();
      }, 2000);
    },
  });

  const wingRotationInterpolate = wingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  if (!isEnabled) {
    return null;
  }

  return (
    <View
      style={styles.container}
      {...panResponder.panHandlers}
      accessibilityLabel="Sofia, your AI assistant"
      accessibilityHint="Touch and move around the screen to interact with Sofia"
      accessibilityRole="button"
      accessible={true}
    >
      {isActive && (
        <Animated.View
          style={[
            styles.firefly,
            {
              width: size,
              height: size,
              transform: [
                { translateX: fireflyPosition.x },
                { translateY: fireflyPosition.y },
                { scale },
              ],
              opacity,
            },
          ]}
        >
          {/* Firefly glow effect */}
          <Animated.View
            style={[
              styles.fireflyGlow,
              {
                width: size * 2,
                height: size * 2,
                borderRadius: size,
                backgroundColor: `rgba(251, 191, 36, ${glowIntensity})`,
                top: -size / 2,
                left: -size / 2,
              },
            ]}
          />

          {/* Firefly body */}
          <View
            style={[
              styles.fireflyBody,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          />

          {/* Animated wings */}
          <Animated.View
            style={[
              styles.fireflyWingLeft,
              {
                transform: [{ rotate: wingRotationInterpolate }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.fireflyWingRight,
              {
                transform: [{ rotate: wingRotationInterpolate }],
              },
            ]}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  firefly: {
    position: 'absolute',
    zIndex: 1001,
  },
  fireflyGlow: {
    position: 'absolute',
  },
  fireflyBody: {
    backgroundColor: emotionalColors.accentYellow,
    shadowColor: emotionalColors.accentYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8, // Android shadow
  },
  fireflyWingLeft: {
    position: 'absolute',
    top: 2,
    left: -4,
    width: 8,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 4,
    transform: [{ rotate: '-30deg' }],
  },
  fireflyWingRight: {
    position: 'absolute',
    top: 2,
    right: -4,
    width: 8,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 4,
    transform: [{ rotate: '30deg' }],
  },
});