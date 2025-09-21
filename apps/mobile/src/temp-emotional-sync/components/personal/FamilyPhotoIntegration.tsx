/**
 * Family Photo Integration Component
 * Visual reminders of who you're protecting
 */

import React, { useState } from 'react';
import { Image, TouchableOpacity, Dimensions } from 'react-native';
import { YStack, XStack, Text, Button, Card } from 'tamagui';
import { Camera, Plus, Heart, X } from '@tamagui/lucide-icons';
import { EmotionalAnimationWrapper } from '../animations';
import { emotionalColors, getTypographyStyle } from '../../theme';
import { useHapticFeedback } from '../../hooks';

const { width: screenWidth } = Dimensions.get('window');

export interface FamilyPhoto {
  id: string;
  uri: string;
  caption?: string;
  dateAdded: Date;
  isMemory?: boolean;
}

export interface FamilyPhotoIntegrationProps {
  photos: FamilyPhoto[];
  onAddPhoto?: () => void;
  onRemovePhoto?: (photoId: string) => void;
  maxPhotos?: number;
  showMotivation?: boolean;
  compactMode?: boolean;
}

export const FamilyPhotoIntegration: React.FC<FamilyPhotoIntegrationProps> = ({
  photos = [],
  onAddPhoto,
  onRemovePhoto,
  maxPhotos = 6,
  showMotivation = true,
  compactMode = false,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const { triggerEncouragement } = useHapticFeedback();

  const photoSize = compactMode ? 60 : 80;
  const hasPhotos = photos.length > 0;
  const canAddMore = photos.length < maxPhotos;

  const handleAddPhoto = () => {
    triggerEncouragement();
    onAddPhoto?.();
  };

  const handleRemovePhoto = (photoId: string) => {
    onRemovePhoto?.(photoId);
    setSelectedPhoto(null);
  };

  const getMotivationMessage = () => {
    if (photos.length === 0) {
      return {
        title: "Add Your Family",
        message: "Seeing their faces reminds you why protection matters.",
        emoji: "💝",
      };
    } else if (photos.length < 3) {
      return {
        title: "Beautiful Family",
        message: "These precious faces inspire your protection journey.",
        emoji: "🌟",
      };
    } else {
      return {
        title: "Your Motivation",
        message: "Every document you protect keeps these smiles safe.",
        emoji: "🛡️",
      };
    }
  };

  const motivation = getMotivationMessage();

  return (
    <Card
      padding={compactMode ? "$3" : "$4"}
      backgroundColor={emotionalColors.backgroundSecondary}
      borderRadius="$4"
      borderColor={emotionalColors.accentYellow}
      borderWidth={hasPhotos ? 1 : 0}
    >
      <YStack space={compactMode ? "$2" : "$3"}>
        {/* Header with motivation */}
        {showMotivation && (
          <EmotionalAnimationWrapper
            animationType="gentleEntrance"
            trigger={hasPhotos}
          >
            <XStack alignItems="center" space="$2" marginBottom="$2">
              <Text fontSize={compactMode ? "$4" : "$5"}>
                {motivation.emoji}
              </Text>
              <YStack flex={1}>
                <Text
                  style={getTypographyStyle(compactMode ? 'headline' : 'emotional')}
                  fontSize={compactMode ? "$4" : "$5"}
                >
                  {motivation.title}
                </Text>
                {!compactMode && (
                  <Text
                    style={getTypographyStyle('bodySecondary')}
                    fontSize="$3"
                  >
                    {motivation.message}
                  </Text>
                )}
              </YStack>
            </XStack>
          </EmotionalAnimationWrapper>
        )}

        {/* Photo Grid */}
        <XStack flexWrap="wrap" space="$2" justifyContent="flex-start">
          {/* Existing Photos */}
          {photos.map((photo, index) => (
            <EmotionalAnimationWrapper
              key={photo.id}
              animationType="gentleEntrance"
              trigger={true}
            >
              <TouchableOpacity
                onPress={() => {
                  triggerEncouragement();
                  setSelectedPhoto(selectedPhoto === photo.id ? null : photo.id);
                }}
                style={{
                  position: 'relative',
                  marginBottom: 8,
                }}
              >
                <Card
                  width={photoSize}
                  height={photoSize}
                  borderRadius="$3"
                  overflow="hidden"
                  borderColor={
                    selectedPhoto === photo.id
                      ? emotionalColors.accentYellow
                      : emotionalColors.backgroundTertiary
                  }
                  borderWidth={selectedPhoto === photo.id ? 2 : 1}
                >
                  <Image
                    source={{ uri: photo.uri }}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode="cover"
                  />
                </Card>

                {/* Remove button when selected */}
                {selectedPhoto === photo.id && onRemovePhoto && (
                  <EmotionalAnimationWrapper
                    animationType="successBurst"
                    trigger={true}
                  >
                    <TouchableOpacity
                      onPress={() => handleRemovePhoto(photo.id)}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: emotionalColors.error,
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <X size={12} color="white" />
                    </TouchableOpacity>
                  </EmotionalAnimationWrapper>
                )}

                {/* Memory indicator */}
                {photo.isMemory && (
                  <XStack
                    position="absolute"
                    top={4}
                    left={4}
                    backgroundColor="rgba(251, 191, 36, 0.8)"
                    borderRadius="$2"
                    paddingHorizontal="$1"
                    alignItems="center"
                  >
                    <Heart size={8} color={emotionalColors.backgroundPrimary} />
                  </XStack>
                )}
              </TouchableOpacity>
            </EmotionalAnimationWrapper>
          ))}

          {/* Add Photo Button */}
          {canAddMore && onAddPhoto && (
            <EmotionalAnimationWrapper
              animationType="guidancePulse"
              trigger={photos.length === 0}
            >
              <Button
                width={photoSize}
                height={photoSize}
                backgroundColor={emotionalColors.backgroundTertiary}
                borderColor={emotionalColors.accentYellow}
                borderWidth={1}
                borderStyle="dashed"
                borderRadius="$3"
                onPress={handleAddPhoto}
                pressStyle={{
                  backgroundColor: emotionalColors.accentYellow,
                  borderStyle: 'solid',
                }}
              >
                <YStack alignItems="center" space="$1">
                  <Plus size={20} color={emotionalColors.accentYellow} />
                  {!compactMode && photos.length === 0 && (
                    <Text
                      color={emotionalColors.accentYellow}
                      fontSize="$2"
                      textAlign="center"
                    >
                      Add
                    </Text>
                  )}
                </YStack>
              </Button>
            </EmotionalAnimationWrapper>
          )}
        </XStack>

        {/* Empty state */}
        {photos.length === 0 && !compactMode && (
          <EmotionalAnimationWrapper
            animationType="comfortFade"
            trigger={true}
          >
            <YStack
              alignItems="center"
              space="$3"
              paddingVertical="$4"
              backgroundColor={emotionalColors.backgroundPrimary}
              borderRadius="$3"
              marginTop="$2"
            >
              <Camera size={32} color={emotionalColors.textMuted} />
              <YStack alignItems="center" space="$1">
                <Text
                  color={emotionalColors.textPrimary}
                  fontSize="$4"
                  fontWeight="600"
                >
                  Share Your Family
                </Text>
                <Text
                  color={emotionalColors.textMuted}
                  fontSize="$3"
                  textAlign="center"
                  maxWidth={screenWidth * 0.6}
                >
                  Add photos to see who you're protecting during your journey
                </Text>
              </YStack>
              {onAddPhoto && (
                <Button
                  size="$3"
                  backgroundColor={emotionalColors.accentYellow}
                  borderRadius="$3"
                  onPress={handleAddPhoto}
                >
                  <XStack alignItems="center" space="$2">
                    <Camera size={14} color={emotionalColors.backgroundPrimary} />
                    <Text
                      color={emotionalColors.backgroundPrimary}
                      fontWeight="600"
                      fontSize="$3"
                    >
                      Add First Photo
                    </Text>
                  </XStack>
                </Button>
              )}
            </YStack>
          </EmotionalAnimationWrapper>
        )}

        {/* Photo count indicator */}
        {hasPhotos && !compactMode && (
          <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
            <Text color={emotionalColors.textMuted} fontSize="$3">
              {photos.length} of {maxPhotos} photos
            </Text>
            {canAddMore && onAddPhoto && (
              <Button
                size="$2"
                backgroundColor="transparent"
                onPress={handleAddPhoto}
              >
                <XStack alignItems="center" space="$1">
                  <Plus size={12} color={emotionalColors.accentYellow} />
                  <Text color={emotionalColors.accentYellow} fontSize="$3">
                    Add more
                  </Text>
                </XStack>
              </Button>
            )}
          </XStack>
        )}
      </YStack>
    </Card>
  );
};