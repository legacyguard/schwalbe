import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface ProgressiveDisclosureProps {
  children: React.ReactNode;
  content: React.ReactNode[];
  trigger?: 'scroll' | 'hover' | 'click' | 'time' | 'engagement' | 'auto';
  threshold?: number;
  delay?: number;
  stagger?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' | 'slide';
  animationType?: 'stagger' | 'wave' | 'cascade' | 'reveal' | 'unfold' | 'bloom';
  engagementThreshold?: number;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onReveal?: (index: number, content: React.ReactNode) => void;
  onComplete?: () => void;
  onReset?: () => void;
}

interface DisclosureStep {
  id: string;
  content: React.ReactNode;
  revealed: boolean;
  timestamp?: number;
}

interface DisclosurePattern {
  name: string;
  trigger: string;
  threshold: number;
  delay: number;
  stagger: number;
  direction: string;
  animationType: string;
  engagementThreshold: number;
  autoPlay: boolean;
  loop: boolean;
}

const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  children,
  content,
  trigger = 'scroll',
  threshold = 0.3,
  delay = 0,
  stagger = 100,
  direction = 'up',
  animationType = 'stagger',
  engagementThreshold = 0.5,
  autoPlay = false,
  loop = false,
  className = '',
  style = {},
  disabled = false,
  onReveal,
  onComplete,
  onReset,
}) => {
  const [steps, setSteps] = useState<DisclosureStep[]>(() =>
    content.map((item, index) => ({
      id: `step-${index}`,
      content: item,
      revealed: false,
    }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [engagementTime, setEngagementTime] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();
  const timerRef = useRef<NodeJS.Timeout>();
  const engagementTimerRef = useRef<NodeJS.Timeout>();
  const shouldReduceMotion = useReducedMotion();

  // Progressive disclosure pattern configurations
  const disclosurePatterns: Record<string, DisclosurePattern> = {
    scrollReveal: {
      name: 'Scroll Reveal',
      trigger: 'scroll',
      threshold: 0.3,
      delay: 0,
      stagger: 150,
      direction: 'up',
      animationType: 'stagger',
      engagementThreshold: 0.5,
      autoPlay: false,
      loop: false,
    },
    hoverCascade: {
      name: 'Hover Cascade',
      trigger: 'hover',
      threshold: 0.1,
      delay: 200,
      stagger: 80,
      direction: 'fade',
      animationType: 'cascade',
      engagementThreshold: 0.3,
      autoPlay: false,
      loop: false,
    },
    timeSequence: {
      name: 'Time Sequence',
      trigger: 'time',
      threshold: 1.0,
      delay: 500,
      stagger: 300,
      direction: 'scale',
      animationType: 'wave',
      engagementThreshold: 0.8,
      autoPlay: true,
      loop: false,
    },
    engagementDriven: {
      name: 'Engagement Driven',
      trigger: 'engagement',
      threshold: 0.7,
      delay: 100,
      stagger: 200,
      direction: 'slide',
      animationType: 'reveal',
      engagementThreshold: 0.9,
      autoPlay: false,
      loop: true,
    },
    autoStory: {
      name: 'Auto Story',
      trigger: 'auto',
      threshold: 0.5,
      delay: 1000,
      stagger: 400,
      direction: 'up',
      animationType: 'unfold',
      engagementThreshold: 0.6,
      autoPlay: true,
      loop: false,
    },
    dramaticReveal: {
      name: 'Dramatic Reveal',
      trigger: 'click',
      threshold: 0.2,
      delay: 50,
      stagger: 100,
      direction: 'scale',
      animationType: 'bloom',
      engagementThreshold: 0.4,
      autoPlay: false,
      loop: false,
    },
  };

  // Animation variants for different directions
  const getAnimationVariants = (index: number) => {
    const baseDelay = delay + (index * stagger);

    const variants = {
      up: {
        hidden: {
          opacity: 0,
          y: shouldReduceMotion ? 0 : 30,
          transition: { duration: 0 },
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            delay: shouldReduceMotion ? 0 : baseDelay / 1000,
            duration: shouldReduceMotion ? 0 : 0.6,
            ease: 'easeOut',
          },
        },
      },
      down: {
        hidden: {
          opacity: 0,
          y: shouldReduceMotion ? 0 : -30,
          transition: { duration: 0 },
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            delay: shouldReduceMotion ? 0 : baseDelay / 1000,
            duration: shouldReduceMotion ? 0 : 0.6,
            ease: 'easeOut',
          },
        },
      },
      left: {
        hidden: {
          opacity: 0,
          x: shouldReduceMotion ? 0 : 30,
          transition: { duration: 0 },
        },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            delay: shouldReduceMotion ? 0 : baseDelay / 1000,
            duration: shouldReduceMotion ? 0 : 0.6,
            ease: 'easeOut',
          },
        },
      },
      right: {
        hidden: {
          opacity: 0,
          x: shouldReduceMotion ? 0 : -30,
          transition: { duration: 0 },
        },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            delay: shouldReduceMotion ? 0 : baseDelay / 1000,
            duration: shouldReduceMotion ? 0 : 0.6,
            ease: 'easeOut',
          },
        },
      },
      fade: {
        hidden: {
          opacity: 0,
          transition: { duration: 0 },
        },
        visible: {
          opacity: 1,
          transition: {
            delay: shouldReduceMotion ? 0 : baseDelay / 1000,
            duration: shouldReduceMotion ? 0 : 0.5,
            ease: 'easeOut',
          },
        },
      },
      scale: {
        hidden: {
          opacity: 0,
          scale: shouldReduceMotion ? 1 : 0.8,
          transition: { duration: 0 },
        },
        visible: {
          opacity: 1,
          scale: 1,
          transition: {
            delay: shouldReduceMotion ? 0 : baseDelay / 1000,
            duration: shouldReduceMotion ? 0 : 0.5,
            ease: 'easeOut',
          },
        },
      },
      slide: {
        hidden: {
          opacity: 0,
          x: shouldReduceMotion ? 0 : 50,
          transition: { duration: 0 },
        },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            delay: shouldReduceMotion ? 0 : baseDelay / 1000,
            duration: shouldReduceMotion ? 0 : 0.7,
            ease: 'easeOut',
          },
        },
      },
    };

    return variants[direction] || variants.up;
  };

  // Reveal step
  const revealStep = useCallback((index: number) => {
    if (disabled || steps[index]?.revealed) return;

    setSteps(prev => prev.map((step, i) =>
      i === index ? { ...step, revealed: true, timestamp: Date.now() } : step
    ));

    onReveal?.(index, content[index]);

    if (index === content.length - 1) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [disabled, steps, content, onReveal, onComplete]);

  // Reveal next step
  const revealNext = useCallback(() => {
    if (currentIndex < content.length) {
      revealStep(currentIndex);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, content.length, revealStep]);

  // Reset disclosure
  const resetDisclosure = useCallback(() => {
    setSteps(prev => prev.map(step => ({ ...step, revealed: false, timestamp: undefined })));
    setCurrentIndex(0);
    setIsComplete(false);
    onReset?.();
  }, [onReset]);

  // Intersection Observer for scroll trigger
  useEffect(() => {
    if (trigger !== 'scroll' || disabled || shouldReduceMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            revealNext();
          }
        });
      },
      { threshold }
    );

    const container = containerRef.current;
    if (container) {
      observer.observe(container);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [trigger, disabled, shouldReduceMotion, threshold, revealNext]);

  // Timer for time-based trigger
  useEffect(() => {
    if (trigger !== 'time' || disabled || shouldReduceMotion) return;

    const timer = setInterval(() => {
      revealNext();
    }, delay + stagger);

    return () => clearInterval(timer);
  }, [trigger, disabled, shouldReduceMotion, delay, stagger, revealNext]);

  // Auto-play effect
  useEffect(() => {
    if (!autoPlay || disabled || shouldReduceMotion || trigger !== 'auto') return;

    const timer = setTimeout(() => {
      revealNext();
    }, delay);

    return () => clearTimeout(timer);
  }, [autoPlay, disabled, shouldReduceMotion, trigger, delay, revealNext]);

  // Engagement tracking
  useEffect(() => {
    if (trigger !== 'engagement' || disabled) return;

    const startTime = Date.now();

    const trackEngagement = () => {
      const elapsed = Date.now() - startTime;
      setEngagementTime(elapsed);

      if (elapsed >= engagementThreshold * 1000) {
        revealNext();
      }
    };

    const timer = setInterval(trackEngagement, 100);
    engagementTimerRef.current = timer;

    return () => {
      if (engagementTimerRef.current) {
        clearInterval(engagementTimerRef.current);
      }
    };
  }, [trigger, disabled, engagementThreshold, revealNext]);

  // Hover trigger
  const handleMouseEnter = () => {
    if (trigger === 'hover' && !disabled) {
      revealNext();
    }
  };

  // Click trigger
  const handleClick = () => {
    if (trigger === 'click' && !disabled) {
      revealNext();
    }
  };

  // Dynamic styles
  const dynamicStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`progressive-disclosure ${className} ${isComplete ? 'disclosure-complete' : ''}`}
      style={dynamicStyles}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {children}

      {/* Progress indicator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
          style={{
            scaleX: steps.filter(step => step.revealed).length / content.length,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Disclosure steps */}
      <div className="relative">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            variants={getAnimationVariants(index)}
            initial="hidden"
            animate={step.revealed ? "visible" : "hidden"}
            className="disclosure-step"
            style={{
              marginBottom: index < steps.length - 1 ? '1rem' : '0',
            }}
          >
            {step.content}

            {/* Step indicator */}
            <motion.div
              className="absolute left-0 top-1/2 w-3 h-3 rounded-full border-2 border-purple-500"
              style={{
                transform: 'translateY(-50%)',
                backgroundColor: step.revealed ? '#8b5cf6' : 'transparent',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: step.revealed ? 1 : 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Completion celebration */}
      <AnimatePresence>
        {isComplete && !shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-6xl"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.6,
                ease: 'easeInOut',
              }}
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={revealNext}
            disabled={currentIndex >= content.length}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm disabled:opacity-50"
          >
            Reveal Next
          </button>
          <button
            onClick={resetDisclosure}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
          >
            Reset
          </button>
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 text-xs bg-black bg-opacity-50 text-white p-2 rounded">
          <div>Steps: {steps.filter(s => s.revealed).length}/{content.length}</div>
          <div>Trigger: {trigger}</div>
          <div>Engagement: {(engagementTime / 1000).toFixed(1)}s</div>
        </div>
      )}
    </div>
  );
};

// Preset progressive disclosure components for easy usage
export const ScrollReveal: React.FC<Omit<ProgressiveDisclosureProps, 'trigger' | 'animationType'>> = (props) => (
  <ProgressiveDisclosure {...props} trigger="scroll" animationType="stagger" />
);

export const HoverCascade: React.FC<Omit<ProgressiveDisclosureProps, 'trigger' | 'animationType'>> = (props) => (
  <ProgressiveDisclosure {...props} trigger="hover" animationType="cascade" />
);

export const TimeSequence: React.FC<Omit<ProgressiveDisclosureProps, 'trigger' | 'animationType'>> = (props) => (
  <ProgressiveDisclosure {...props} trigger="time" animationType="wave" />
);

export const EngagementDriven: React.FC<Omit<ProgressiveDisclosureProps, 'trigger' | 'animationType'>> = (props) => (
  <ProgressiveDisclosure {...props} trigger="engagement" animationType="reveal" />
);

export const AutoStory: React.FC<Omit<ProgressiveDisclosureProps, 'trigger' | 'animationType'>> = (props) => (
  <ProgressiveDisclosure {...props} trigger="auto" animationType="unfold" />
);

export const DramaticReveal: React.FC<Omit<ProgressiveDisclosureProps, 'trigger' | 'animationType'>> = (props) => (
  <ProgressiveDisclosure {...props} trigger="click" animationType="bloom" />
);

export default ProgressiveDisclosure;