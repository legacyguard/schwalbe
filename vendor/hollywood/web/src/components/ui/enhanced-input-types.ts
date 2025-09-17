
import type * as React from 'react';

import type { IconMap } from '@/components/ui/icon-library';

// Re-export inputVariants for type usage
export { inputVariants } from './enhanced-input-variants';

// Field state types
export type FieldState =
  | 'error'
  | 'filled'
  | 'focused'
  | 'idle'
  | 'loading'
  | 'success'
  | 'warning';

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  animateLabel?: boolean;
  animateOnError?: boolean;
  animateOnFocus?: boolean;
  error?: boolean | string;

  errorIcon?: keyof typeof IconMap;
  errorText?: string;
  glowEffect?: boolean;
  helpText?: string;
  // Enhanced label and help text
  label?: string;

  // Icon props
  leftIcon?: keyof typeof IconMap;
  loading?: boolean;
  loadingIcon?: keyof typeof IconMap;
  maxLength?: number;
  // Animation props
  personalityAdapt?: boolean;
  rightIcon?: keyof typeof IconMap;

  rippleEffect?: boolean;
  // Visual enhancements
  showCharacterCount?: boolean;
  // Stagger animation delay
  staggerDelay?: number;
  // Field state props
  state?: FieldState;
  success?: boolean;

  successIcon?: keyof typeof IconMap;
  successText?: string;
  warning?: boolean | string;
  warningIcon?: keyof typeof IconMap;

  warningText?: string;
}
