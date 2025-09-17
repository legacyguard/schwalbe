
import * as React from 'react';
import type { EnhancedButtonProps } from './enhanced-button-types';

// This component is defined in enhanced-button.tsx
declare const EnhancedButton: React.ForwardRefExoticComponent<
  EnhancedButtonProps & React.RefAttributes<HTMLButtonElement>
>;

// Loading button variant
export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  Omit<EnhancedButtonProps, 'loading' | 'loadingIcon' | 'loadingText'>
>(({ children, ...props }, ref) => (
  <EnhancedButton
    ref={ref}
    loading={true}
    loadingText='Loading...'
    loadingIcon='loader'
    disabled={true}
    {...props}
  >
    {children}
  </EnhancedButton>
));

LoadingButton.displayName = 'LoadingButton';

// Personality-adaptive button variant
export const PersonalityButton = React.forwardRef<
  HTMLButtonElement,
  Omit<EnhancedButtonProps, 'animationType' | 'personalityAdapt'>
>(({ children, ...props }, ref) => (
  <EnhancedButton
    ref={ref}
    personalityAdapt={true}
    animationType='hover-lift'
    rippleEffect={true}
    {...props}
  >
    {children}
  </EnhancedButton>
));

PersonalityButton.displayName = 'PersonalityButton';

// Action button variant
export const ActionButton = React.forwardRef<
  HTMLButtonElement,
  Omit<EnhancedButtonProps, 'rippleEffect' | 'size' | 'variant'>
>(({ children, ...props }, ref) => (
  <EnhancedButton
    ref={ref}
    rippleEffect={true}
    animationType='button-press'
    {...props}
  >
    {children}
  </EnhancedButton>
));

ActionButton.displayName = 'ActionButton';
