
'use client';

import { motion, type Variants } from 'framer-motion';
import React from 'react';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

const fadeInAnimation: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: (custom: { delay: number; duration: number }) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom.duration,
      delay: custom.delay,
      ease: 'easeInOut',
    },
  }),
};

export const FadeIn = ({
  children,
  duration = 0.5,
  delay = 0,
  className,
}: FadeInProps) => {
  return (
    <motion.div
      className={className}
      variants={fadeInAnimation}
      initial='initial'
      animate='animate'
      custom={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
};
