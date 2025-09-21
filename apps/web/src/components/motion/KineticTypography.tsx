import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

export type KineticEffect =
  | 'typewriter'
  | 'fadeInWords'
  | 'slideInLines'
  | 'morphingLetters'
  | 'waveText'
  | 'floatingWords'
  | 'rotatingText'
  | 'elasticScale'
  | 'magneticPull'
  | 'liquidText';

export type ContentContext =
  | 'heading'
  | 'subheading'
  | 'body'
  | 'caption'
  | 'quote'
  | 'callToAction'
  | 'navigation'
  | 'notification'
  | 'error'
  | 'success';

export type AnimationSequence = 'sequential' | 'parallel' | 'staggered' | 'wave' | 'cascade';

interface KineticTypographyProps {
  children: React.ReactNode;
  effect?: KineticEffect;
  context?: ContentContext;
  sequence?: AnimationSequence;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
  duration?: number;
  intensity?: 'subtle' | 'moderate' | 'intense';
  trigger?: 'inView' | 'hover' | 'load' | 'custom';
  autoPlay?: boolean;
  loop?: boolean;
  onComplete?: () => void;
  onStart?: () => void;
}

const contextDefaults: Record<ContentContext, {
  effect: KineticEffect;
  sequence: AnimationSequence;
  intensity: 'subtle' | 'moderate' | 'intense';
}> = {
  heading: {
    effect: 'elasticScale',
    sequence: 'staggered',
    intensity: 'intense'
  },
  subheading: {
    effect: 'fadeInWords',
    sequence: 'wave',
    intensity: 'moderate'
  },
  body: {
    effect: 'slideInLines',
    sequence: 'sequential',
    intensity: 'subtle'
  },
  caption: {
    effect: 'typewriter',
    sequence: 'sequential',
    intensity: 'subtle'
  },
  quote: {
    effect: 'floatingWords',
    sequence: 'cascade',
    intensity: 'moderate'
  },
  callToAction: {
    effect: 'magneticPull',
    sequence: 'parallel',
    intensity: 'intense'
  },
  navigation: {
    effect: 'waveText',
    sequence: 'wave',
    intensity: 'moderate'
  },
  notification: {
    effect: 'elasticScale',
    sequence: 'parallel',
    intensity: 'moderate'
  },
  error: {
    effect: 'morphingLetters',
    sequence: 'staggered',
    intensity: 'intense'
  },
  success: {
    effect: 'floatingWords',
    sequence: 'cascade',
    intensity: 'moderate'
  }
};

export const KineticTypography: React.FC<KineticTypographyProps> = ({
  children,
  effect,
  context = 'body',
  sequence,
  className,
  as: Component = 'div',
  delay = 0,
  duration = 1,
  intensity = 'moderate',
  trigger = 'inView',
  autoPlay = false,
  loop = false,
  onComplete,
  onStart,
}) => {
  const [isVisible, setIsVisible] = useState(autoPlay);
  const [isAnimating, setIsAnimating] = useState(false);
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const contextConfig = contextDefaults[context];
  const activeEffect = effect || contextConfig.effect;
  const activeSequence = sequence || contextConfig.sequence;

  // Handle trigger logic
  useEffect(() => {
    if (trigger === 'load') {
      setIsVisible(true);
    } else if (trigger === 'inView' && isInView) {
      setIsVisible(true);
    }
  }, [trigger, isInView]);

  // Start animation when visible
  useEffect(() => {
    if (!isVisible) return;

    const startAnimation = async () => {
      setIsAnimating(true);
      onStart?.();

      await controls.start(getAnimationVariants());

      setIsAnimating(false);
      onComplete?.();
    };

    const timer = setTimeout(startAnimation, delay * 1000);
    return () => clearTimeout(timer);
  }, [isVisible, controls, delay, onStart, onComplete]);

  const getAnimationVariants = () => {
    const baseDuration = duration;
    const intensityMultiplier = intensity === 'subtle' ? 0.7 : intensity === 'intense' ? 1.3 : 1;

    switch (activeEffect) {
      case 'typewriter':
        return {
          opacity: 1,
          transition: {
            duration: baseDuration * intensityMultiplier,
            ease: "easeInOut"
          }
        };

      case 'fadeInWords':
        return {
          opacity: [0, 1],
          y: [20, 0],
          transition: {
            duration: baseDuration * intensityMultiplier,
            ease: "easeOut"
          }
        };

      case 'slideInLines':
        return {
          opacity: [0, 1],
          x: [-50, 0],
          transition: {
            duration: baseDuration * intensityMultiplier,
            ease: "easeOut"
          }
        };

      case 'morphingLetters':
        return {
          scale: [0.8, 1.2, 1],
          rotate: [0, 10, 0],
          transition: {
            duration: baseDuration * intensityMultiplier,
            ease: "easeOut"
          }
        };

      case 'waveText':
        return {
          y: [0, -10, 0],
          transition: {
            duration: baseDuration * intensityMultiplier,
            ease: "easeInOut",
            repeat: loop ? Infinity : 0,
            repeatType: loop ? "reverse" as const : undefined
          }
        };

      case 'floatingWords':
        return {
          y: [0, -5, 0],
          opacity: [0.7, 1, 0.7],
          transition: {
            duration: baseDuration * intensityMultiplier,
            ease: "easeInOut",
            repeat: loop ? Infinity : 0,
            repeatType: loop ? "reverse" as const : undefined
          }
        };

      case 'rotatingText':
        return {
          rotate: [0, 360],
          transition: {
            duration: baseDuration * intensityMultiplier,
            ease: "linear",
            repeat: loop ? Infinity : 0
          }
        };

      case 'elasticScale':
        return {
          scale: [0.5, 1.1, 1],
          transition: {
            duration: baseDuration * intensityMultiplier,
            ease: "easeOut",
            type: "spring" as const,
            stiffness: 200,
            damping: 10
          }
        };

      case 'magneticPull':
        return {
          scale: [1, 1.05, 1],
          transition: {
            duration: baseDuration * intensityMultiplier,
            ease: "easeOut"
          }
        };

      case 'liquidText':
        return {
          borderRadius: ["0%", "50%", "0%"],
          scale: [1, 1.02, 1],
          transition: {
            duration: baseDuration * intensityMultiplier,
            ease: "easeInOut",
            repeat: loop ? Infinity : 0,
            repeatType: loop ? "reverse" as const : undefined
          }
        };

      default:
        return {
          opacity: [0, 1],
          transition: {
            duration: baseDuration * intensityMultiplier,
            ease: "easeOut"
          }
        };
    }
  };

  const renderContent = () => {
    const content = React.Children.toArray(children);

    if (activeSequence === 'staggered' && content.length > 1) {
      return content.map((child, index) => (
        <motion.span
          key={index}
          ref={ref}
          className={cn('inline-block', className)}
          animate={controls}
          initial={{ opacity: 0, y: 20 }}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {child}
        </motion.span>
      ));
    }

    if (activeSequence === 'wave' && content.length > 1) {
      return content.map((child, index) => (
        <motion.span
          key={index}
          ref={ref}
          className={cn('inline-block', className)}
          animate={controls}
          initial={{ opacity: 0, y: 20 }}
          style={{
            animationDelay: `${index * 0.05}s`,
            transform: `translateY(${Math.sin(index) * 5}px)`
          }}
        >
          {child}
        </motion.span>
      ));
    }

    if (activeSequence === 'cascade' && content.length > 1) {
      return content.map((child, index) => (
        <motion.div
          key={index}
          ref={ref}
          className={className}
          animate={controls}
          initial={{ opacity: 0, x: -30 }}
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          {child}
        </motion.div>
      ));
    }

    return (
      <motion.div
        ref={ref}
        className={className}
        animate={controls}
        initial={{ opacity: 0 }}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <Component className={cn('kinetic-typography', className)}>
      <AnimatePresence>
        {isVisible && renderContent()}
      </AnimatePresence>
    </Component>
  );
};

// Specialized kinetic typography components
export const TypewriterText: React.FC<Omit<KineticTypographyProps, 'effect'>> = (props) => (
  <KineticTypography {...props} effect="typewriter" />
);

export const MorphingText: React.FC<Omit<KineticTypographyProps, 'effect'>> = (props) => (
  <KineticTypography {...props} effect="morphingLetters" />
);

export const WaveText: React.FC<Omit<KineticTypographyProps, 'effect'>> = (props) => (
  <KineticTypography {...props} effect="waveText" />
);

export const FloatingText: React.FC<Omit<KineticTypographyProps, 'effect'>> = (props) => (
  <KineticTypography {...props} effect="floatingWords" />
);

export const ElasticText: React.FC<Omit<KineticTypographyProps, 'effect'>> = (props) => (
  <KineticTypography {...props} effect="elasticScale" />
);

export const MagneticText: React.FC<Omit<KineticTypographyProps, 'effect'>> = (props) => (
  <KineticTypography {...props} effect="magneticPull" />
);

export const LiquidText: React.FC<Omit<KineticTypographyProps, 'effect'>> = (props) => (
  <KineticTypography {...props} effect="liquidText" />
);

// Context-specific components
export const HeadingText: React.FC<Omit<KineticTypographyProps, 'context'>> = (props) => (
  <KineticTypography {...props} context="heading" />
);

export const QuoteText: React.FC<Omit<KineticTypographyProps, 'context'>> = (props) => (
  <KineticTypography {...props} context="quote" />
);

export const CTA_Text: React.FC<Omit<KineticTypographyProps, 'context'>> = (props) => (
  <KineticTypography {...props} context="callToAction" />
);

export const ErrorText: React.FC<Omit<KineticTypographyProps, 'context'>> = (props) => (
  <KineticTypography {...props} context="error" />
);

export const SuccessText: React.FC<Omit<KineticTypographyProps, 'context'>> = (props) => (
  <KineticTypography {...props} context="success" />
);