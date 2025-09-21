/**
 * Emotional Sync Components - Main Export
 * Temporary implementation space for emotional features
 * 
 * This file provides lazy-loaded exports to reduce bundle size
 */

import React from 'react';

// Theme exports (always needed)
export * from './theme';

// Lazy component exports - only load when needed
export const MobileSofiaFirefly = React.lazy(() => import('./components/sofia-firefly').then(m => ({ default: m.MobileSofiaFirefly })));
export const EmotionalAnimationWrapper = React.lazy(() => import('./components/animations').then(m => ({ default: m.EmotionalAnimationWrapper })));
export const EmotionalMessageCard = React.lazy(() => import('./components/messaging').then(m => ({ default: m.EmotionalMessageCard })));
export const AchievementCelebration = React.lazy(() => import('./components/achievements').then(m => ({ default: m.AchievementCelebration })));
export const DailyCheckIn = React.lazy(() => import('./components/personal').then(m => ({ default: m.DailyCheckIn })));

// Hook exports (not lazy since they're not components)
export { useEmotionalState, useSofiaMessages } from './hooks';

// Utility exports (not lazy since they're not components)
export { EmotionalAnimations } from './utils/emotionalAnimations';

// Re-export types (lightweight)
export type { EmotionalAnimationWrapperProps } from './components/animations';
export type { EmotionalMessageCardProps } from './components/messaging';
export type { AchievementCelebrationProps } from './components/achievements';