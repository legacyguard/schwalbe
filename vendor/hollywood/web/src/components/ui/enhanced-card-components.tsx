
import * as React from 'react';
import type { EnhancedCardProps } from './enhanced-card-types';

// This component is defined in enhanced-card.tsx
declare const EnhancedCard: React.ForwardRefExoticComponent<
  EnhancedCardProps & React.RefAttributes<HTMLDivElement>
>;

// Personality-adaptive card variant
export const PersonalityCard = React.forwardRef<
  HTMLDivElement,
  Omit<EnhancedCardProps, 'animationType' | 'personalityAdapt'>
>(({ children, ...props }, ref) => (
  <EnhancedCard
    ref={ref}
    personalityAdapt={true}
    animationType='lift'
    hoverEffect={true}
    clickEffect={true}
    {...props}
  >
    {children}
  </EnhancedCard>
));

PersonalityCard.displayName = 'PersonalityCard';

// Interactive card variant
export const InteractiveCard = React.forwardRef<
  HTMLDivElement,
  Omit<EnhancedCardProps, 'clickEffect' | 'hoverEffect' | 'interactive'>
>(({ children, ...props }, ref) => (
  <EnhancedCard
    ref={ref}
    // interactive={true}
    hoverEffect={true}
    clickEffect={true}
    animationType='lift'
    {...props}
  >
    {children}
  </EnhancedCard>
));

InteractiveCard.displayName = 'InteractiveCard';

// Content-focused card variant
export const ContentCard = React.forwardRef<
  HTMLDivElement,
  Omit<EnhancedCardProps, 'interactive' | 'size' | 'variant'>
>(({ children, ...props }, ref) => (
  <EnhancedCard
    ref={ref}
    // variant="default"
    // size="default"
    // interactive={false}
    hoverEffect={false}
    clickEffect={false}
    {...props}
  >
    {children}
  </EnhancedCard>
));

ContentCard.displayName = 'ContentCard';
