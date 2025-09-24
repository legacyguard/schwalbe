
import React from 'react';
import { type GetProps, styled, Text, View } from '@tamagui/core';
import {
  AlertCircle,
  CheckCircle,
  Info,
  X,
  XCircle,
} from '@tamagui/lucide-icons';
import { Button } from './Button';
import { XStack, YStack } from './Layout';

// Alert Container
export const Alert = React.memo(styled(YStack, {
  name: 'LGAlert',
  borderRadius: '$2',
  padding: '$4',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$background',

  variants: {
    variant: {
      info: {
        borderColor: '$info',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
      },
      success: {
        borderColor: '$success',
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
      },
      warning: {
        borderColor: '$warning',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
      },
      error: {
        borderColor: '$error',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
      },
      default: {
        borderColor: '$borderColor',
        backgroundColor: '$background',
      },
    },
    size: {
      sm: {
        padding: '$2',
      },
      md: {
        padding: '$4',
      },
      lg: {
        padding: '$6',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
}));

// Alert Icon
export const AlertIcon = ({
  variant = 'default',
  ...props
}: {
  variant?: 'default' | 'error' | 'info' | 'success' | 'warning';
} & React.ComponentProps<typeof Info>) => {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
    default: Info,
  };

  const Icon = icons[variant as keyof typeof icons] || icons.default;
  const color = variant === 'default' ? '$gray6' : `$${variant}`;

  return <Icon size={20} color={color} {...props} />;
};

// Alert Title
export const AlertTitle = React.memo(styled(Text, {
  name: 'LGAlertTitle',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$1',
}));

// Alert Description
export const AlertDescription = React.memo(styled(Text, {
  name: 'LGAlertDescription',
  fontSize: '$4',
  color: '$gray6',
  lineHeight: 1.5,
}));

// Alert Close Button
export const AlertCloseButton = ({
  onPress,
  ...props
}: GetProps<typeof Button>) => (
  <Button
    size='small'
    variant='ghost'
    circular
    icon={<X size={16} />}
    onPress={onPress}
    {...props}
  />
);

// Alert Component with composition
export const AlertBox = React.memo(({
  variant = 'default',
  title,
  description,
  showIcon = true,
  closable = false,
  onClose,
  children,
  ...props
}: {
  children?: React.ReactNode;
  closable?: boolean;
  description?: string;
  onClose?: () => void;
  showIcon?: boolean;
  title?: string;
  variant?: 'default' | 'error' | 'info' | 'success' | 'warning';
} & GetProps<typeof Alert>) => {
  return (
    <Alert variant={variant} {...props}>
      <XStack space='small' alignItems='flex-start'>
        {showIcon && <AlertIcon variant={variant} />}
        <YStack flex={1} space='xs'>
          {title && <AlertTitle>{title}</AlertTitle>}
          {description && <AlertDescription>{description}</AlertDescription>}
          {children}
        </YStack>
        {closable && <AlertCloseButton onPress={onClose} />}
      </XStack>
    </Alert>
  );
});

AlertBox.displayName = 'AlertBox';

// Export types
export type AlertProps = GetProps<typeof Alert>;
export type AlertTitleProps = GetProps<typeof AlertTitle>;
export type AlertDescriptionProps = GetProps<typeof AlertDescription>;
export type AlertBoxProps = Parameters<typeof AlertBox>[0];
