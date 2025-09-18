/**
 * Achievement Celebration Component
 * Shows celebratory animations and messages for milestones
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { Card, YStack, XStack, Text, Button } from 'tamagui';
import { Share } from '@tamagui/lucide-icons';
import { EmotionalAnimationWrapper } from '../animations';
import { emotionalColors } from '../../theme/colors';
import { useHapticFeedback } from '../../hooks';

const { width: screenWidth } = Dimensions.get('window');

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  shareText?: string;
  unlockedAt: Date;
}

export interface AchievementCelebrationProps {
  achievement: Achievement;
  onDismiss: () => void;
  onShare?: () => void;
  visible: boolean;
}

export const AchievementCelebration: React.FC<AchievementCelebrationProps> = ({
  achievement,
  onDismiss,
  onShare,
  visible,
}) => {
  const { triggerAchievement } = useHapticFeedback();
  const particleAnimations = useRef<Animated.Value[]>([]);
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Initialize particle animations
  useEffect(() => {
    particleAnimations.current = Array.from({ length: 20 }, () => new Animated.Value(0));
  }, []);

  // Trigger celebration when visible
  useEffect(() => {
    if (visible) {
      triggerAchievement();
      startCelebration();
    } else {
      overlayOpacity.setValue(0);
    }
  }, [visible]);

  const startCelebration = () => {
    // Fade in overlay
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Start particle burst animation
    const animations = particleAnimations.current.map((particle, index) => {
      return Animated.sequence([
        Animated.delay(index * 50),
        Animated.timing(particle, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(particle, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start();
  };

  const handleDismiss = () => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const handleShare = () => {
    onShare?.();
    handleDismiss();
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      {/* Particle system */}
      <View style={styles.particleContainer}>
        {particleAnimations.current.map((particle, index) => (
          <Particle key={index} animatedValue={particle} index={index} />
        ))}
      </View>

      {/* Achievement card */}
      <View style={styles.cardContainer}>
        <EmotionalAnimationWrapper
          animationType="achievementShine"
          trigger={visible}
        >
          <Card
            padding="$6"
            backgroundColor={emotionalColors.accentYellow}
            borderRadius="$6"
            shadowColor={emotionalColors.accentYellow}
            shadowOffset={{ width: 0, height: 8 }}
            shadowOpacity={0.3}
            shadowRadius={16}
            elevation={8}
            maxWidth={screenWidth * 0.85}
          >
            <YStack alignItems="center" space="$4">
              {/* Achievement icon */}
              <Text fontSize={48} marginBottom="$2">
                {achievement.icon}
              </Text>

              {/* Achievement title */}
              <Text
                color={emotionalColors.backgroundPrimary}
                fontSize="$7"
                fontWeight="800"
                textAlign="center"
                lineHeight={32}
              >
                {achievement.title}
              </Text>

              {/* Achievement description */}
              <Text
                color={emotionalColors.backgroundSecondary}
                fontSize="$5"
                textAlign="center"
                lineHeight={24}
                maxWidth={250}
              >
                {achievement.description}
              </Text>

              {/* Action buttons */}
              <XStack space="$3" marginTop="$3">
                {achievement.shareText && (
                  <Button
                    size="$4"
                    backgroundColor={emotionalColors.backgroundPrimary}
                    borderRadius="$4"
                    onPress={handleShare}
                  >
                    <XStack alignItems="center" space="$2">
                      <Share size={16} color={emotionalColors.textPrimary} />
                      <Text color={emotionalColors.textPrimary} fontWeight="600">
                        Share
                      </Text>
                    </XStack>
                  </Button>
                )}

                <Button
                  size="$4"
                  backgroundColor={emotionalColors.backgroundSecondary}
                  borderRadius="$4"
                  onPress={handleDismiss}
                >
                  <Text color={emotionalColors.textPrimary} fontWeight="600">
                    Continue
                  </Text>
                </Button>
              </XStack>
            </YStack>
          </Card>
        </EmotionalAnimationWrapper>
      </View>
    </Animated.View>
  );
};

// Individual particle component
interface ParticleProps {
  animatedValue: Animated.Value;
  index: number;
}

const Particle: React.FC<ParticleProps> = ({ animatedValue, index }) => {
  const icons = ['⭐', '✨', '🌟', '💫', '🎉', '🎊', '💝', '🏆'];
  const icon = icons[index % icons.length];

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -200 - Math.random() * 100],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (Math.random() - 0.5) * 200],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1.2, 0],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: (screenWidth / 20) * (index % 10),
          transform: [
            { translateY },
            { translateX },
            { scale },
          ],
          opacity,
        },
      ]}
    >
      <Text fontSize={20}>{icon}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    bottom: '60%',
  },
  cardContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});