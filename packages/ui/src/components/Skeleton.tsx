
import React from 'react';
import { type GetProps, styled, View } from '@tamagui/core';
import { XStack, YStack } from './Layout';

// Base Skeleton component with animation
export const Skeleton = React.memo(styled(View, {
  name: 'LGSkeleton',
  backgroundColor: '$gray3',
  borderRadius: '$1',
  overflow: 'hidden',
  position: 'relative',

  // Add shimmer animation
  animation: 'lazy',
  animateOnly: ['opacity'],
  opacity: 0.7,

  enterStyle: {
    opacity: 0.5,
  },

  exitStyle: {
    opacity: 0.5,
  },

  variants: {
    variant: {
      text: {
        height: 16,
        borderRadius: 4,
      },
      title: {
        height: 24,
        borderRadius: 4,
      },
      button: {
        height: 44,
        borderRadius: 8,
      },
      avatar: {
        borderRadius: 9999,
      },
      card: {
        borderRadius: 8,
      },
      image: {
        borderRadius: 8,
      },
    },
    width: {
      small: { width: '25%' },
      medium: { width: '50%' },
      large: { width: '75%' },
      full: { width: '100%' },
    },
    height: {
      small: { height: 32 },
      medium: { height: 48 },
      large: { height: 64 },
      xlarge: { height: 80 },
    },
    animated: {
      true: {
        animation: 'slow',
        animateOnly: ['backgroundColor'],
        backgroundColor: '$gray3',
        enterStyle: {
          backgroundColor: '$gray2',
        },
        exitStyle: {
          backgroundColor: '$gray4',
        },
      },
    },
  },
}));

// Skeleton Text - for loading text
export const SkeletonText = ({
  lines = 3,
  spacing = 'small',
  ...props
}: {
  lines?: number;
  spacing?: GetProps<typeof YStack>['space'];
} & GetProps<typeof YStack>) => {
  return (
    <YStack space={spacing} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? '75%' : '100%'}
        />
      ))}
    </YStack>
  );
};

// Skeleton Avatar
export const SkeletonAvatar = React.memo(styled(Skeleton, {
  name: 'LGSkeletonAvatar',
  width: 92,
  height: 92,
  borderRadius: 9999,

  variants: {
    size: {
      small: {
        width: 76,
        height: 76,
      },
      medium: {
        width: 92,
        height: 92,
      },
      large: {
        width: 108,
        height: 108,
      },
      xlarge: {
        width: 140,
        height: 140,
      },
    },
  },
}));

// Skeleton Card
export const SkeletonCard = ({
  showAvatar = true,
  showTitle = true,
  showDescription = true,
  ...props
}: {
  showAvatar?: boolean;
  showDescription?: boolean;
  showTitle?: boolean;
} & GetProps<typeof View>) => {
  return (
    <View
      padding='$4'
      borderRadius='$2'
      borderWidth={1}
      borderColor='$borderColor'
      backgroundColor='$background'
      {...props}
    >
      <XStack space='small' alignItems='flex-start'>
        {showAvatar && <SkeletonAvatar />}
        <YStack flex={1} space='small'>
          {showTitle && (
            <Skeleton height={24} width="100%" />
          )}
          {showDescription && <SkeletonText lines={2} />}
        </YStack>
      </XStack>
    </View>
  );
};

// Skeleton List
export const SkeletonList = ({
  items = 3,
  spacing = 'medium',
  renderItem,
  ...props
}: {
  items?: number;
  renderItem?: (index: number) => React.ReactNode;
  spacing?: GetProps<typeof YStack>['space'];
} & GetProps<typeof YStack>) => {
  return (
    <YStack space={spacing} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <View key={i}>{renderItem ? renderItem(i) : <SkeletonCard />}</View>
      ))}
    </YStack>
  );
};

// Skeleton Button
export const SkeletonButton = React.memo(styled(Skeleton, {
  name: 'LGSkeletonButton',
  borderRadius: 8,

  variants: {
    size: {
      small: {
        height: 76,
        width: 160,
      },
      medium: {
        height: 92,
        width: 200,
      },
      large: {
        height: 108,
        width: 240,
      },
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  },
}));

// Skeleton Image
export const SkeletonImage = React.memo(styled(Skeleton, {
  name: 'LGSkeletonImage',
  width: '100%',
  borderRadius: 8,

  variants: {
    aspectRatio: {
      square: {
        aspectRatio: 1,
      },
      video: {
        aspectRatio: 16 / 9,
      },
      portrait: {
        aspectRatio: 3 / 4,
      },
      landscape: {
        aspectRatio: 4 / 3,
      },
    },
  },
}));

// Export types
export type SkeletonProps = GetProps<typeof Skeleton>;
export type SkeletonTextProps = Parameters<typeof SkeletonText>[0];
export type SkeletonAvatarProps = GetProps<typeof SkeletonAvatar>;
export type SkeletonCardProps = Parameters<typeof SkeletonCard>[0];
export type SkeletonListProps = Parameters<typeof SkeletonList>[0];
export type SkeletonButtonProps = GetProps<typeof SkeletonButton>;
export type SkeletonImageProps = GetProps<typeof SkeletonImage>;
