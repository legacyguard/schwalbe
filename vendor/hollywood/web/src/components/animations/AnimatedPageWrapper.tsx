
// Animated Page Wrapper - Provides consistent page transitions with Sofia's personality
// Integrates with Sofia's personality system for adaptive animations

import React, { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { usePersonalityManager } from '@/components/sofia/SofiaContextProvider';
import { AnimationSystem } from '@/lib/animation-system';

interface AnimatedPageWrapperProps {
  children: ReactNode;
  className?: string;
  enablePageTransitions?: boolean;
}

export const AnimatedPageWrapper: React.FC<AnimatedPageWrapperProps> = ({
  children,
  className = '',
  enablePageTransitions = true,
}) => {
  const location = useLocation();
  const personalityManager = usePersonalityManager();

  // Get current personality mode for animations
  const personalityMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const adaptedMode =
    personalityMode === 'balanced' ? 'adaptive' : personalityMode;

  // Check for reduced motion preference
  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();

  if (!enablePageTransitions || shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const pageVariants = AnimationSystem.createPageTransition(adaptedMode);

  return (
    <AnimatePresence mode='wait' initial={false}>
      <motion.div
        key={location.pathname}
        className={className}
        variants={pageVariants}
        initial='initial'
        animate='animate'
        exit='exit'
        {...AnimationSystem.getOptimizedProps()}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedPageWrapper;
