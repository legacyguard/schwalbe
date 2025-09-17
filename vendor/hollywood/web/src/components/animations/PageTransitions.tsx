
// Page Transitions - Advanced page transition system with Sofia's personality adaptation
// Provides seamless navigation experience that adapts to user preferences

import React, { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { usePersonalityManager } from '@/components/sofia/SofiaContextProvider';
import { AnimationSystem } from '@/lib/animation-system';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  mode?: 'popLayout' | 'sync' | 'wait';
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  mode = 'wait',
}) => {
  const location = useLocation();
  const personalityManager = usePersonalityManager();

  const personalityMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const adaptedMode =
    personalityMode === 'balanced' ? 'adaptive' : personalityMode;

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const pageVariants = AnimationSystem.createPageTransition(adaptedMode);

  return (
    <AnimatePresence mode={mode} initial={false}>
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

interface RouteTransitionProps {
  children: ReactNode;
  direction?: 'backward' | 'forward';
  transitionKey?: string;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  transitionKey,
  direction = 'forward',
}) => {
  const location = useLocation();
  const personalityManager = usePersonalityManager();

  const personalityMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const adaptedMode =
    personalityMode === 'balanced' ? 'adaptive' : personalityMode;

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();

  const getDirectionalVariants = () => {
    const animConfig = AnimationSystem.getConfig(adaptedMode);

    if (shouldReduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    const slideDistance = adaptedMode === 'empathetic' ? 30 : 20;

    return {
      initial: {
        opacity: 0,
        x: direction === 'forward' ? slideDistance : -slideDistance,
        scale: adaptedMode === 'empathetic' ? 0.98 : 1,
      },
      animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
          duration: animConfig.duration,
          ease: animConfig.ease,
        },
      },
      exit: {
        opacity: 0,
        x: direction === 'forward' ? -slideDistance : slideDistance,
        scale: adaptedMode === 'empathetic' ? 1.02 : 1,
        transition: {
          duration: animConfig.duration * 0.8,
          ease: animConfig.ease,
        },
      },
    };
  };

  return (
    <AnimatePresence mode='wait' initial={false}>
      <motion.div
        key={transitionKey || location.pathname}
        variants={getDirectionalVariants() as any}
        initial='initial'
        animate='animate'
        exit='exit'
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

interface ModalTransitionProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  size?: 'lg' | 'md' | 'sm' | 'xl';
}

export const ModalTransition: React.FC<ModalTransitionProps> = ({
  children,
  isOpen,
  onClose,
  size = 'md',
}) => {
  const personalityManager = usePersonalityManager();

  const personalityMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const adaptedMode =
    personalityMode === 'balanced' ? 'adaptive' : personalityMode;

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();
  const animConfig = AnimationSystem.getConfig(adaptedMode);

  const modalSizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : animConfig.duration * 0.8,
      },
    },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: shouldReduceMotion
        ? 1
        : adaptedMode === 'empathetic'
          ? 0.85
          : 0.95,
      y: shouldReduceMotion ? 0 : adaptedMode === 'empathetic' ? 20 : 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : animConfig.duration,
        ease: animConfig.ease,
        delay: shouldReduceMotion ? 0 : animConfig.delay,
      },
    },
    exit: {
      opacity: 0,
      scale: shouldReduceMotion
        ? 1
        : adaptedMode === 'empathetic'
          ? 0.85
          : 0.95,
      y: shouldReduceMotion ? 0 : adaptedMode === 'empathetic' ? -10 : 5,
      transition: {
        duration: shouldReduceMotion ? 0.1 : animConfig.duration * 0.7,
        ease: animConfig.ease,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            variants={overlayVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={`relative bg-white rounded-xl shadow-xl w-full ${modalSizes[size]} max-h-[90vh] overflow-y-auto`}
            variants={modalVariants as any}
            initial='hidden'
            animate='visible'
            exit='exit'
            onClick={e => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface SlideTransitionProps {
  children: ReactNode;
  className?: string;
  direction: 'down' | 'left' | 'right' | 'up';
  isVisible: boolean;
}

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  direction,
  isVisible,
  className = '',
}) => {
  const personalityManager = usePersonalityManager();

  const personalityMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const adaptedMode =
    personalityMode === 'balanced' ? 'adaptive' : personalityMode;

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();
  const animConfig = AnimationSystem.getConfig(adaptedMode);

  const getSlideVariants = () => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };
    }

    const distance = adaptedMode === 'empathetic' ? 50 : 30;

    const initial = {
      opacity: 0,
      ...(direction === 'up' && { y: distance }),
      ...(direction === 'down' && { y: -distance }),
      ...(direction === 'left' && { x: distance }),
      ...(direction === 'right' && { x: -distance }),
    };

    const animate = {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: animConfig.duration,
        ease: animConfig.ease,
      },
    };

    return {
      hidden: initial,
      visible: animate,
    };
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          variants={getSlideVariants() as any}
          initial='hidden'
          animate='visible'
          exit='hidden'
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface FadeTransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  isVisible: boolean;
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  isVisible,
  duration,
  delay,
  className = '',
}) => {
  const personalityManager = usePersonalityManager();

  const personalityMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const adaptedMode =
    personalityMode === 'balanced' ? 'adaptive' : personalityMode;

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();
  const animConfig = AnimationSystem.getConfig(adaptedMode);

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : duration || animConfig.duration,
        delay: shouldReduceMotion ? 0 : delay || animConfig.delay,
        ease: animConfig.ease,
      },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          variants={fadeVariants as any}
          initial='hidden'
          animate='visible'
          exit='hidden'
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Navigation breadcrumb with transitions
interface BreadcrumbTransitionProps {
  items: Array<{ active?: boolean; href?: string; label: string }>;
  onItemClick?: (index: number) => void;
}

export const BreadcrumbTransition: React.FC<BreadcrumbTransitionProps> = ({
  items,
  onItemClick,
}) => {
  const personalityManager = usePersonalityManager();

  const personalityMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const adaptedMode =
    personalityMode === 'balanced' ? 'adaptive' : personalityMode;

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();
  // const _animConfig = AnimationSystem.getConfig(adaptedMode);

  const containerVariants = AnimationSystem.createStaggerContainer(adaptedMode);
  const itemVariants = AnimationSystem.createStaggerItem(adaptedMode);

  return (
    <motion.nav
      className='flex items-center space-x-2 text-sm'
      {...(shouldReduceMotion
        ? {}
        : {
            variants: containerVariants,
            initial: 'initial',
            animate: 'animate',
          })}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <motion.span
            className={`${
              item.active
                ? 'text-gray-900 font-medium'
                : 'text-gray-500 hover:text-gray-700 cursor-pointer'
            } transition-colors`}
            {...(shouldReduceMotion ? {} : { variants: itemVariants })}
            {...(onItemClick ? { onClick: () => onItemClick(index) } : {})}
          >
            {item.label}
          </motion.span>

          {index < items.length - 1 && (
            <motion.span
              className='text-gray-400'
              {...(shouldReduceMotion ? {} : { variants: itemVariants })}
            >
              /
            </motion.span>
          )}
        </React.Fragment>
      ))}
    </motion.nav>
  );
};

export default {
  PageTransition,
  RouteTransition,
  ModalTransition,
  SlideTransition,
  FadeTransition,
  BreadcrumbTransition,
};
