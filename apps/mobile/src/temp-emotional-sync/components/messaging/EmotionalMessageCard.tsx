/**
 * Emotional Message Card Component
 * Displays emotional messages with animations and actions
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Card, YStack, XStack, Text, Button } from 'tamagui';
import { router } from 'expo-router';
import { EmotionalAnimationWrapper } from '../animations';
import { EmotionalMessage } from './EmotionalMessages';
import { emotionalColors } from '../../theme/colors';

export interface EmotionalMessageCardProps {
  message: EmotionalMessage;
  variant?: 'default' | 'success' | 'comfort' | 'achievement';
  onDismiss?: () => void;
  showAnimation?: boolean;
  compactMode?: boolean;
}

export const EmotionalMessageCard: React.FC<EmotionalMessageCardProps> = ({
  message,
  variant = 'default',
  onDismiss,
  showAnimation = true,
  compactMode = false,
}) => {
  const getCardTheme = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: emotionalColors.success,
          borderColor: emotionalColors.success,
        };
      case 'comfort':
        return {
          backgroundColor: emotionalColors.backgroundSecondary,
          borderColor: emotionalColors.accentYellow,
          borderWidth: 1,
        };
      case 'achievement':
        return {
          backgroundColor: emotionalColors.accentYellow,
          borderColor: emotionalColors.accentYellowDark,
        };
      default:
        return {
          backgroundColor: emotionalColors.backgroundSecondary,
          borderColor: emotionalColors.backgroundTertiary,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'achievement':
        return emotionalColors.backgroundPrimary;
      default:
        return emotionalColors.textPrimary;
    }
  };

  const handleActionPress = () => {
    if (message.action?.route) {
      router.push(message.action.route as any);
    }
    onDismiss?.();
  };

  const CardContent = (
    <Card
      padding={compactMode ? '$3' : '$4'}
      marginBottom="$3"
      {...getCardTheme()}
      borderRadius="$4"
      shadowColor={emotionalColors.backgroundPrimary}
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.3}
      shadowRadius={8}
      elevation={4}
    >
      <YStack space={compactMode ? '$2' : '$3'}>
        {/* Header with emoji and title */}
        {(message.emoji || message.title) && (
          <XStack alignItems="center" space="$2">
            {message.emoji && (
              <Text fontSize={compactMode ? '$5' : '$6'}>
                {message.emoji}
              </Text>
            )}
            {message.title && (
              <Text
                color={getTextColor()}
                fontSize={compactMode ? '$5' : '$6'}
                fontWeight="600"
                flex={1}
              >
                {message.title}
              </Text>
            )}
          </XStack>
        )}

        {/* Message content */}
        <Text
          color={variant === 'achievement' ? emotionalColors.backgroundPrimary : emotionalColors.textSecondary}
          fontSize={compactMode ? '$3' : '$4'}
          lineHeight={compactMode ? 20 : 24}
        >
          {message.message}
        </Text>

        {/* Action button */}
        {message.action && (
          <XStack justifyContent="flex-end" marginTop="$2">
            <Button
              size={compactMode ? '$3' : '$4'}
              theme={variant === 'achievement' ? 'dark' : 'blue'}
              onPress={handleActionPress}
              backgroundColor={
                variant === 'achievement'
                  ? emotionalColors.backgroundPrimary
                  : emotionalColors.accentYellow
              }
              borderRadius="$3"
            >
              <Text
                color={
                  variant === 'achievement'
                    ? emotionalColors.textPrimary
                    : emotionalColors.backgroundPrimary
                }
                fontWeight="600"
                fontSize={compactMode ? '$3' : '$4'}
              >
                {message.action.text}
              </Text>
            </Button>
          </XStack>
        )}
      </YStack>
    </Card>
  );

  if (!showAnimation) {
    return CardContent;
  }

  const getAnimationType = () => {
    switch (variant) {
      case 'success':
        return 'successBurst';
      case 'achievement':
        return 'achievementShine';
      case 'comfort':
        return 'comfortFade';
      default:
        return 'gentleEntrance';
    }
  };

  return (
    <EmotionalAnimationWrapper
      animationType={getAnimationType() as any}
      trigger={true}
    >
      {CardContent}
    </EmotionalAnimationWrapper>
  );
};