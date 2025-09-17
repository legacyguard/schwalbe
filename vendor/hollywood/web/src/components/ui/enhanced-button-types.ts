
import type * as React from 'react';

import type { IconMap } from '@/components/ui/icon-library';

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Enhanced animation props
  animationType?: 'button-press' | 'hover-glow' | 'hover-lift' | 'tap-bounce';
  asChild?: boolean;
  error?: boolean;
  errorIcon?: keyof typeof IconMap;
  errorText?: string;
  // Icon props
  leftIcon?: keyof typeof IconMap;
  // Loading and state props
  loading?: boolean;
  loadingIcon?: keyof typeof IconMap;
  loadingText?: string;
  personalityAdapt?: boolean;
  rightIcon?: keyof typeof IconMap;
  rippleEffect?: boolean;
  // Animation props
  staggerDelay?: number;
  success?: boolean;
  successIcon?: keyof typeof IconMap;
  successText?: string;
}

// Re-export buttonVariants for type usage
export { buttonVariants } from './enhanced-button-variants';
