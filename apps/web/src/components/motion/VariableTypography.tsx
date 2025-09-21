import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

import { cn } from '@/lib/utils';

export type EmphasisLevel = 'subtle' | 'moderate' | 'strong' | 'extreme';

export type AnimationTrigger = 'hover' | 'focus' | 'inView' | 'load' | 'custom';

export type TypographyProperty =
  | 'fontWeight'
  | 'fontSize'
  | 'letterSpacing'
  | 'lineHeight'
  | 'textTransform'
  | 'fontStyle';

export type AnimationEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring' | 'bounce';

interface TypographyAnimation {
  property: TypographyProperty;
  from: string | number;
  to: string | number;
  duration?: number;
  delay?: number;
  easing?: AnimationEasing;
  repeat?: number;
  yoyo?: boolean;
}

interface VariableTypographyProps {
  children: React.ReactNode;
  emphasisLevel?: EmphasisLevel;
  trigger?: AnimationTrigger;
  animations?: TypographyAnimation[];
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  disabled?: boolean;
  autoPlay?: boolean;
  staggerChildren?: boolean;
  staggerDelay?: number;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}

const emphasisPresets: Record<EmphasisLevel, TypographyAnimation[]> = {
  subtle: [
    {
      property: 'fontWeight',
      from: 400,
      to: 500,
      duration: 0.3,
      easing: 'easeOut'
    },
    {
      property: 'letterSpacing',
      from: '0px',
      to: '0.5px',
      duration: 0.3,
      easing: 'easeOut'
    }
  ],
  moderate: [
    {
      property: 'fontWeight',
      from: 400,
      to: 600,
      duration: 0.4,
      easing: 'easeOut'
    },
    {
      property: 'fontSize',
      from: '1em',
      to: '1.1em',
      duration: 0.4,
      easing: 'easeOut'
    },
    {
      property: 'letterSpacing',
      from: '0px',
      to: '1px',
      duration: 0.4,
      easing: 'easeOut'
    }
  ],
  strong: [
    {
      property: 'fontWeight',
      from: 400,
      to: 700,
      duration: 0.5,
      easing: 'spring'
    },
    {
      property: 'fontSize',
      from: '1em',
      to: '1.2em',
      duration: 0.5,
      easing: 'spring'
    },
    {
      property: 'letterSpacing',
      from: '0px',
      to: '1.5px',
      duration: 0.5,
      easing: 'spring'
    },
    {
      property: 'textTransform',
      from: 'none',
      to: 'uppercase',
      duration: 0.5,
      easing: 'easeOut'
    }
  ],
  extreme: [
    {
      property: 'fontWeight',
      from: 400,
      to: 900,
      duration: 0.6,
      easing: 'bounce'
    },
    {
      property: 'fontSize',
      from: '1em',
      to: '1.4em',
      duration: 0.6,
      easing: 'bounce'
    },
    {
      property: 'letterSpacing',
      from: '0px',
      to: '2px',
      duration: 0.6,
      easing: 'bounce'
    },
    {
      property: 'textTransform',
      from: 'none',
      to: 'uppercase',
      duration: 0.6,
      easing: 'easeOut'
    },
    {
      property: 'fontStyle',
      from: 'normal',
      to: 'italic',
      duration: 0.6,
      easing: 'easeOut'
    }
  ]
};

const getEasingFunction = (easing: AnimationEasing) => {
  switch (easing) {
    case 'spring':
      return [0.16, 1, 0.3, 1]; // Custom spring curve
    case 'bounce':
      return [0.68, -0.55, 0.265, 1.55]; // Bounce curve
    case 'easeIn':
      return [0.4, 0, 1, 1];
    case 'easeOut':
      return [0, 0, 0.2, 1];
    case 'easeInOut':
      return [0.4, 0, 0.2, 1];
    default:
      return [0, 0, 1, 1];
  }
};

export const VariableTypography: React.FC<VariableTypographyProps> = ({
  children,
  emphasisLevel = 'moderate',
  trigger = 'hover',
  animations = emphasisPresets[emphasisLevel],
  className,
  as: Component = 'span',
  disabled = false,
  autoPlay = false,
  staggerChildren = false,
  staggerDelay = 0.1,
  onAnimationStart,
  onAnimationComplete,
}) => {
  const [isTriggered, setIsTriggered] = useState(autoPlay);
  const [isAnimating, setIsAnimating] = useState(false);
  const controls = useAnimation();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Handle trigger logic
  useEffect(() => {
    if (disabled) return;

    switch (trigger) {
      case 'inView':
        if (isInView) {
          setIsTriggered(true);
        }
        break;
      case 'load':
        setIsTriggered(true);
        break;
      case 'custom':
        // Custom trigger handled externally
        break;
    }
  }, [trigger, isInView, disabled]);

  // Start animations when triggered
  useEffect(() => {
    if (disabled || !isTriggered) return;

    setIsAnimating(true);
    onAnimationStart?.();

    const animate = async () => {
      // Single element animation
      const animationVariants = animations.reduce((acc, animation) => {
        acc[animation.property] = animation.to;
        return acc;
      }, {} as Record<string, any>);

      await controls.start({
        ...animationVariants,
        transition: {
          duration: animations[0]?.duration || 0.5,
          ease: getEasingFunction(animations[0]?.easing || 'easeOut'),
          repeat: animations[0]?.repeat || 0,
          repeatType: animations[0]?.yoyo ? 'reverse' : 'loop'
        }
      });

      setIsAnimating(false);
      onAnimationComplete?.();
    };

    animate();
  }, [isTriggered, disabled, animations, controls, staggerChildren, staggerDelay, onAnimationStart, onAnimationComplete]);

  const handleInteractionStart = () => {
    if (disabled || trigger !== 'hover') return;
    setIsTriggered(true);
  };

  const handleInteractionEnd = () => {
    if (disabled || trigger !== 'hover') return;
    setIsTriggered(false);
    setIsAnimating(false);
    controls.stop();
  };

  const handleFocus = () => {
    if (disabled || trigger !== 'focus') return;
    setIsTriggered(true);
  };

  const handleBlur = () => {
    if (disabled || trigger !== 'focus') return;
    setIsTriggered(false);
    setIsAnimating(false);
    controls.stop();
  };

  const getInitialStyles = () => {
    return animations.reduce((acc, animation) => {
      acc[animation.property] = animation.from;
      return acc;
    }, {} as Record<string, any>);
  };

  const renderChildren = () => {
    if (staggerChildren && React.Children.count(children) > 1) {
      return React.Children.map(children, (child, index) => (
        <motion.span
          key={index}
          ref={ref}
          className={cn('inline-block', className)}
          animate={controls}
          style={getInitialStyles()}
          initial={getInitialStyles()}
        >
          {child}
        </motion.span>
      ));
    }

    return (
      <motion.span
        ref={ref}
        className={className}
        animate={controls}
        style={getInitialStyles()}
        initial={getInitialStyles()}
        onHoverStart={handleInteractionStart}
        onHoverEnd={handleInteractionEnd}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={trigger === 'focus' ? 0 : undefined}
      >
        {children}
      </motion.span>
    );
  };

  return (
    <Component
      className={cn(
        'variable-typography',
        disabled && 'pointer-events-none',
        trigger === 'focus' && 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded'
      )}
    >
      {renderChildren()}
    </Component>
  );
};

// Specialized typography components
export const EmphasisText: React.FC<Omit<VariableTypographyProps, 'emphasisLevel'>> = (props) => (
  <VariableTypography {...props} emphasisLevel="moderate" />
);

export const StrongEmphasisText: React.FC<Omit<VariableTypographyProps, 'emphasisLevel'>> = (props) => (
  <VariableTypography {...props} emphasisLevel="strong" />
);

export const ExtremeEmphasisText: React.FC<Omit<VariableTypographyProps, 'emphasisLevel'>> = (props) => (
  <VariableTypography {...props} emphasisLevel="extreme" />
);

export const SubtleEmphasisText: React.FC<Omit<VariableTypographyProps, 'emphasisLevel'>> = (props) => (
  <VariableTypography {...props} emphasisLevel="subtle" />
);

// Hook for custom typography animations
export const useVariableTypography = () => {
  const controls = useAnimation();
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = async (animations: TypographyAnimation[]) => {
    setIsAnimating(true);

    const animationVariants = animations.reduce((acc, animation) => {
      acc[animation.property] = animation.to;
      return acc;
    }, {} as Record<string, any>);

    await controls.start({
      ...animationVariants,
      transition: {
        duration: animations[0]?.duration || 0.5,
        ease: getEasingFunction(animations[0]?.easing || 'easeOut'),
        repeat: animations[0]?.repeat || 0,
        repeatType: animations[0]?.yoyo ? 'reverse' : 'loop'
      }
    });

    setIsAnimating(false);
  };

  const reset = async () => {
    await controls.stop();
    setIsAnimating(false);
  };

  return {
    controls,
    isAnimating,
    animate,
    reset
  };
};