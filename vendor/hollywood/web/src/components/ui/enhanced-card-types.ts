
import type * as React from 'react';

import type { IconMap } from '@/components/ui/icon-library';

// Re-export cardVariants for type usage
export { cardVariants } from './enhanced-card-variants';

// Card interaction types
export type CardInteractionType =
  | 'bounce'
  | 'flip'
  | 'glow'
  | 'lift'
  | 'morphing'
  | 'pulse'
  | 'scale'
  | 'shake'
  | 'slide'
  | 'tilt';

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  animationDuration?: number;
  // Animation props
  animationType?: CardInteractionType;
  backgroundPattern?: boolean;
  borderGradient?: boolean;

  clickEffect?: boolean;
  collapsible?: boolean;
  description?: string;
  disabled?: boolean;
  // Layout props
  expandable?: boolean;

  expanded?: boolean;
  // Visual props
  glowColor?: string;
  highlighted?: boolean;
  hoverEffect?: boolean;

  // Interaction props
  href?: string;
  icon?: keyof typeof IconMap;
  image?: string;
  // State props
  loading?: boolean;

  onClick?: () => void;
  onDoubleClick?: () => void;
  onHover?: (isHovered: boolean) => void;

  personalityAdapt?: boolean;
  selected?: boolean;
  // Animation timing
  staggerDelay?: number;

  subtitle?: string;
  // Content props
  title?: string;
}
