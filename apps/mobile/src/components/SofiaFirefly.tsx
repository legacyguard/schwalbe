import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Dimensions } from 'react-native';
import { YStack, Text } from 'tamagui';

const { width, height } = Dimensions.get('window');

interface SofiaFireflyProps {
  onTouch?: () => void;
  isActive?: boolean;
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export const SofiaFirefly: React.FC<SofiaFireflyProps> = ({
  onTouch,
  isActive = true,
  size = 'medium',
  message = "Sofia's light guides your path",
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0.7)).current;
  const [showMessage, setShowMessage] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const getSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 48;
      default: return 32;
    }
  };

  const fireflySize = getSize();

  useEffect(() => {
    if (isActive) {
      // Gentle floating animation
      const floatAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );

      // Gentle pulsing opacity
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      floatAnimation.start();
      pulseAnimation.start();

      return () => {
        floatAnimation.stop();
        pulseAnimation.stop();
      };
    }
  }, [isActive, animatedValue, opacityValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (touchAnimationRef.current) {
        touchAnimationRef.current.stop();
      }
    };
  }, []);

  const handlePress = () => {
    // Clean up previous timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Stop previous touch animation if running
    if (touchAnimationRef.current) {
      touchAnimationRef.current.stop();
    }

    // Touch interaction animation
    touchAnimationRef.current = Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    touchAnimationRef.current.start();

    // Show message briefly
    setShowMessage(true);
    timeoutRef.current = setTimeout(() => setShowMessage(false), 2000);

    onTouch?.();
  };

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 8, 0],
  });

  if (!isActive) return null;

  return (
    <YStack position="relative" alignItems="center">
      <Pressable onPress={handlePress}>
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
          <YStack
            width={fireflySize}
            height={fireflySize}
            borderRadius={fireflySize / 2}
            backgroundColor="$legacyAccentGold"
            alignItems="center"
            justifyContent="center"
            shadowColor="$legacyAccentGold"
            shadowOffset={{ width: 0, height: 0 }}
            shadowOpacity={0.8}
            shadowRadius={8}
            elevation={8}
          >
            <Text fontSize={fireflySize * 0.6} lineHeight={fireflySize}>
              ✨
            </Text>
          </YStack>
        </Animated.View>
      </Pressable>

      {showMessage && (
        <Animated.View
          style={{
            position: 'absolute',
            top: fireflySize + 10,
            opacity: opacityValue,
          }}
        >
          <YStack
            backgroundColor="$legacyBackgroundSecondary"
            borderColor="$legacyAccentGold"
            borderWidth={1}
            borderRadius="$3"
            padding="$2"
            maxWidth={200}
            alignItems="center"
          >
            <Text
              color="$legacyAccentGold"
              fontSize="$3"
              fontWeight="500"
              textAlign="center"
            >
              {message}
            </Text>
          </YStack>
        </Animated.View>
      )}
    </YStack>
  );
};

export default SofiaFirefly;