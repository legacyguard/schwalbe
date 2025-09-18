import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { Star, Trophy, Shield, Heart } from '@tamagui/lucide-icons';

const { width, height } = Dimensions.get('window');

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'star' | 'trophy' | 'shield' | 'heart';
  category: 'document' | 'protection' | 'family' | 'milestone';
  level: 'bronze' | 'silver' | 'gold';
  emotionalMessage: string;
}

interface AchievementCelebrationProps {
  achievement: Achievement | null;
  visible: boolean;
  onDismiss: () => void;
  onHapticFeedback?: () => void;
}

export const AchievementCelebration: React.FC<AchievementCelebrationProps> = ({
  achievement,
  visible,
  onDismiss,
  onHapticFeedback,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const sparkleAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible && achievement) {
      setShowContent(true);
      onHapticFeedback?.();

      // Main celebration animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Sparkle animations with staggered delays
      sparkleAnims.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [visible, achievement]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowContent(false);
      onDismiss();
    });
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'star': return Star;
      case 'trophy': return Trophy;
      case 'shield': return Shield;
      case 'heart': return Heart;
      default: return Star;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return '$orange10';
      case 'silver': return '$gray11';
      case 'gold': return '$legacyAccentGold';
      default: return '$legacyAccentGold';
    }
  };

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      default: return '⭐';
    }
  };

  if (!showContent || !achievement) return null;

  const IconComponent = getIcon(achievement.icon);
  const levelColor = getLevelColor(achievement.level);
  const levelEmoji = getLevelEmoji(achievement.level);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <YStack
        flex={1}
        backgroundColor="rgba(15, 23, 42, 0.9)"
        justifyContent="center"
        alignItems="center"
        padding="$4"
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <YStack
            backgroundColor="$legacyBackgroundSecondary"
            borderColor="$legacyAccentGold"
            borderWidth={2}
            borderRadius="$6"
            padding="$6"
            alignItems="center"
            space="$4"
            maxWidth={320}
            position="relative"
          >
            {/* Sparkles */}
            {sparkleAnims.map((anim, index) => {
              const angle = (index / sparkleAnims.length) * 2 * Math.PI;
              const radius = 120;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <Animated.View
                  key={index}
                  style={{
                    position: 'absolute',
                    left: 160 + x,
                    top: 100 + y,
                    opacity: anim,
                    transform: [
                      {
                        scale: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1.5],
                        }),
                      },
                    ],
                  }}
                >
                  <Text fontSize="$6" color="$legacyAccentGold">
                    ✨
                  </Text>
                </Animated.View>
              );
            })}

            {/* Achievement Icon */}
            <YStack
              width={80}
              height={80}
              borderRadius={40}
              backgroundColor={levelColor}
              alignItems="center"
              justifyContent="center"
              shadowColor="$legacyAccentGold"
              shadowOffset={{ width: 0, height: 0 }}
              shadowOpacity={0.6}
              shadowRadius={12}
              elevation={12}
            >
              <IconComponent size={40} color="white" />
            </YStack>

            {/* Achievement Details */}
            <YStack alignItems="center" space="$2">
              <XStack alignItems="center" space="$2">
                <Text fontSize="$2" color="$legacyTextMuted" fontWeight="600">
                  ACHIEVEMENT UNLOCKED
                </Text>
                <Text fontSize="$4">{levelEmoji}</Text>
              </XStack>

              <Text
                color="$legacyTextPrimary"
                fontSize="$6"
                fontWeight="700"
                textAlign="center"
              >
                {achievement.title}
              </Text>

              <Text
                color="$legacyTextSecondary"
                fontSize="$4"
                fontWeight="500"
                textAlign="center"
                lineHeight={20}
              >
                {achievement.description}
              </Text>
            </YStack>

            {/* Emotional Message */}
            <YStack
              backgroundColor="$legacyBackgroundPrimary"
              borderColor="$legacyAccentGold"
              borderWidth={1}
              borderRadius="$4"
              padding="$3"
              alignItems="center"
            >
              <Text
                color="$legacyAccentGold"
                fontSize="$3"
                fontWeight="600"
                textAlign="center"
                lineHeight={18}
              >
                {achievement.emotionalMessage}
              </Text>
            </YStack>

            {/* Continue Button */}
            <Button
              size="$4"
              backgroundColor="$legacyAccentGold"
              borderRadius="$3"
              onPress={handleDismiss}
              width="100%"
            >
              <Text color="$legacyBackgroundPrimary" fontWeight="700">
                Continue Your Journey 🌟
              </Text>
            </Button>
          </YStack>
        </Animated.View>
      </YStack>
    </Modal>
  );
};

// Achievement definitions for the app
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_document',
    title: 'First Seed Planted',
    description: 'You\'ve added your first document to the garden',
    icon: 'star',
    category: 'document',
    level: 'bronze',
    emotionalMessage: 'Every legacy begins with a single step. You\'ve taken yours.',
  },
  {
    id: 'document_milestone_5',
    title: 'Growing Garden',
    description: 'Five documents now flourish in your protection garden',
    icon: 'shield',
    category: 'document',
    level: 'silver',
    emotionalMessage: 'Your family\'s story grows stronger with each document you preserve.',
  },
  {
    id: 'family_member_added',
    title: 'Circle of Trust',
    description: 'You\'ve invited your first family member',
    icon: 'heart',
    category: 'family',
    level: 'bronze',
    emotionalMessage: 'Love shared is love multiplied. Your circle of protection grows.',
  },
  {
    id: 'protection_complete',
    title: 'Guardian\'s Shield',
    description: 'Full protection activated for your family',
    icon: 'shield',
    category: 'protection',
    level: 'gold',
    emotionalMessage: 'You are the guardian your family needed. They are safe because of you.',
  },
  {
    id: 'legacy_master',
    title: 'Legacy Master',
    description: 'You\'ve created a comprehensive family legacy system',
    icon: 'trophy',
    category: 'milestone',
    level: 'gold',
    emotionalMessage: 'Generations will thank you for the love and care you\'ve shown today.',
  },
];

export default AchievementCelebration;