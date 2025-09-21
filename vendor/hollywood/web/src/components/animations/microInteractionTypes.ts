
import type { ReactNode } from 'react';

// Animation type definitions
export type MicroAnimationType =
  | 'button-press'
  | 'card-flip'
  | 'error-shake'
  | 'fade-in-up'
  | 'focus-ring'
  | 'hover-glow'
  | 'hover-lift'
  | 'loading-pulse'
  | 'scale-in'
  | 'slide-reveal'
  | 'success-checkmark'
  | 'tap-bounce';

export interface MicroAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  disabled?: boolean;
  onAnimationComplete?: () => void;
  type: MicroAnimationType;
}
