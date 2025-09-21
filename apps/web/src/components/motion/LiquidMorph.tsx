import React from 'react';
import { motion, Variants } from 'framer-motion';

import { cn } from '@/lib/utils';

interface LiquidMorphProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  trigger?: 'hover' | 'tap' | 'view' | 'auto';
  duration?: number;
  delay?: number;
}

const liquidVariants: Record<string, Variants> = {
  subtle: {
    initial: { borderRadius: '8px' },
    animate: {
      borderRadius: ['8px', '16px', '12px', '8px'],
      scale: [1, 1.02, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    hover: {
      borderRadius: ['8px', '24px', '16px', '8px'],
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  },
  medium: {
    initial: { borderRadius: '12px' },
    animate: {
      borderRadius: ['12px', '24px', '16px', '12px'],
      scale: [1, 1.05, 1],
      rotate: [0, 1, -1, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    hover: {
      borderRadius: ['12px', '32px', '20px', '12px'],
      scale: [1, 1.08, 1],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  },
  strong: {
    initial: { borderRadius: '16px' },
    animate: {
      borderRadius: ['16px', '32px', '24px', '16px'],
      scale: [1, 1.1, 1],
      rotate: [0, 3, -3, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    hover: {
      borderRadius: ['16px', '40px', '28px', '16px'],
      scale: [1, 1.15, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 1,
        ease: 'easeOut',
      },
    },
  },
};

export const LiquidMorph: React.FC<LiquidMorphProps> = ({
  children,
  className,
  intensity = 'medium',
  trigger = 'hover',
  duration = 0.6,
  delay = 0,
}) => {
  const variants = liquidVariants[intensity];

  return (
    <motion.div
      className={cn(
        'liquid-morph-container overflow-hidden',
        className
      )}
      variants={variants}
      initial="initial"
      animate={trigger === 'auto' ? 'animate' : 'initial'}
      whileHover={trigger === 'hover' ? 'hover' : undefined}
      whileTap={trigger === 'tap' ? 'hover' : undefined}
      transition={{ duration, delay }}
      style={{
        willChange: 'transform, border-radius',
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  );
};