import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface HoverSequencesProps {
  children: React.ReactNode;
  stages?: number;
  trigger?: 'hover' | 'focus' | 'click' | 'proximity';
  direction?: 'horizontal' | 'vertical' | 'radial' | 'spiral' | 'wave';
  timing?: 'sequential' | 'simultaneous' | 'staggered' | 'cascade';
  easing?: 'linear' | 'easeInOut' | 'easeOut' | 'easeIn' | 'anticipate' | 'backOut';
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  onStageChange?: (stage: number, direction: 'forward' | 'backward') => void;
  onComplete?: (direction: 'forward' | 'backward') => void;
}

interface HoverStage {
  id: number;
  elements: React.ReactNode[];
  transform: {
    scale?: number;
    rotate?: number;
    translateX?: number;
    translateY?: number;
    opacity?: number;
  };
  filter: {
    blur?: number;
    brightness?: number;
    contrast?: number;
    saturate?: number;
    hueRotate?: number;
  };
  timing: {
    delay: number;
    duration: number;
    easing: string;
  };
}

interface SequenceConfig {
  stages: number;
  direction: string;
  timing: string;
  easing: string;
  duration: number;
  delay: number;
}

const HoverSequences: React.FC<HoverSequencesProps> = ({
  children,
  stages = 3,
  trigger = 'hover',
  direction = 'horizontal',
  timing = 'staggered',
  easing = 'easeOut',
  duration = 0.6,
  delay = 0.1,
  className = '',
  style = {},
  onStageChange,
  onComplete,
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sequenceDirection, setSequenceDirection] = useState<'forward' | 'backward'>('forward');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

  // Mouse position tracking for proximity trigger
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform mouse position to trigger proximity
  const proximityTrigger = useTransform(
    [mouseX, mouseY],
    ([x, y]) => {
      if (!containerRef.current) return 0;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(Math.pow(Number(x) - centerX, 2) + Math.pow(Number(y) - centerY, 2));
      return Math.max(0, 1 - distance / (Math.max(rect.width, rect.height) / 2));
    }
  );

  // Generate hover stages based on configuration
  const generateStages = (): HoverStage[] => {
    const stageArray: HoverStage[] = [];

    for (let i = 0; i <= stages; i++) {
      const progress = i / stages;

      stageArray.push({
        id: i,
        elements: [],
        transform: {
          scale: 1 + progress * 0.1,
          rotate: direction === 'spiral' ? progress * 180 : 0,
          translateX: direction === 'horizontal' ? progress * 20 : 0,
          translateY: direction === 'vertical' ? progress * 20 : 0,
          opacity: 1 - progress * 0.2,
        },
        filter: {
          blur: progress * 2,
          brightness: 1 + progress * 0.2,
          contrast: 1 + progress * 0.3,
          saturate: 1 + progress * 0.4,
          hueRotate: progress * 30,
        },
        timing: {
          delay: i * delay,
          duration: duration * (1 - progress * 0.3),
          easing,
        },
      });
    }

    return stageArray;
  };

  const hoverStages = generateStages();

  // Animation variants for different sequence types
  const getSequenceVariants = () => {
    const baseVariants: Record<string, any> = {};

    hoverStages.forEach((stage) => {
      baseVariants[`stage${stage.id}`] = {
        scale: stage.transform.scale,
        rotate: stage.transform.rotate,
        x: stage.transform.translateX,
        y: stage.transform.translateY,
        opacity: stage.transform.opacity,
        filter: `
          blur(${stage.filter.blur}px)
          brightness(${stage.filter.brightness})
          contrast(${stage.filter.contrast})
          saturate(${stage.filter.saturate})
          hue-rotate(${stage.filter.hueRotate}deg)
        `.trim(),
        transition: {
          delay: stage.timing.delay,
          duration: stage.timing.duration,
          ease: stage.timing.easing,
        },
      };
    });

    return baseVariants;
  };

  // Handle stage progression
  const progressStage = (direction: 'forward' | 'backward') => {
    if (shouldReduceMotion) return;

    const newStage = direction === 'forward'
      ? Math.min(currentStage + 1, stages)
      : Math.max(currentStage - 1, 0);

    setCurrentStage(newStage);
    setSequenceDirection(direction);
    onStageChange?.(newStage, direction);

    if (newStage === stages || newStage === 0) {
      onComplete?.(direction);
    }
  };

  // Event handlers
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsActive(true);
      progressStage('forward');
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsActive(false);
      progressStage('backward');
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      setIsActive(true);
      progressStage('forward');
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      setIsActive(false);
      progressStage('backward');
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsActive(!isActive);
      progressStage(isActive ? 'backward' : 'forward');
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    mouseX.set(x);
    mouseY.set(y);
    setMousePosition({ x, y });

    // Proximity trigger
    if (trigger === 'proximity') {
      const proximity = proximityTrigger.get();
      const targetStage = Math.floor(proximity * stages);
      if (targetStage !== currentStage) {
        setCurrentStage(targetStage);
        onStageChange?.(targetStage, targetStage > currentStage ? 'forward' : 'backward');
      }
    }
  };

  // Auto-progression for demonstration
  useEffect(() => {
    if (!isActive || shouldReduceMotion) return;

    const interval = setInterval(() => {
      if (currentStage < stages) {
        progressStage('forward');
      } else {
        progressStage('backward');
      }
    }, (duration + delay) * 1000);

    return () => clearInterval(interval);
  }, [isActive, currentStage, stages, duration, delay, shouldReduceMotion]);

  // Dynamic styles based on current stage
  const dynamicStyles: React.CSSProperties = {
    cursor: trigger === 'click' ? 'pointer' : 'default',
    transition: shouldReduceMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };

  return (
    <motion.div
      ref={containerRef}
      className={`hover-sequence ${className}`}
      style={dynamicStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      animate={`stage${currentStage}`}
      variants={getSequenceVariants()}
      initial="stage0"
      tabIndex={trigger === 'focus' ? 0 : -1}
      role={trigger === 'click' ? 'button' : undefined}
      aria-label={`Interactive element with ${stages} hover stages`}
    >
      {children}

      {/* Stage indicators */}
      {stages > 1 && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {Array.from({ length: stages + 1 }, (_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i === currentStage ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              animate={{
                scale: i === currentStage ? 1.2 : 1,
                opacity: i === currentStage ? 1 : 0.5,
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      )}

      {/* Progressive disclosure elements */}
      <AnimatePresence>
        {currentStage >= 1 && (
          <motion.div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentStage >= 2 && (
          <motion.div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.2, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{
              background: 'linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentStage >= 3 && (
          <motion.div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.15, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{
              background: 'conic-gradient(from 0deg, rgba(34, 197, 94, 0.1), rgba(251, 191, 36, 0.1), rgba(239, 68, 68, 0.1), rgba(34, 197, 94, 0.1))',
            }}
          />
        )}
      </AnimatePresence>

      {/* Interactive feedback */}
      {isActive && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-inherit pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            mixBlendMode: 'overlay',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      )}

      {/* Stage information for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          Stage {currentStage}/{stages} • {trigger} • {direction}
        </div>
      )}
    </motion.div>
  );
};

// Preset hover sequence components for easy usage
export const SequentialHover: React.FC<Omit<HoverSequencesProps, 'timing'>> = (props) => (
  <HoverSequences {...props} timing="sequential" />
);

export const StaggeredHover: React.FC<Omit<HoverSequencesProps, 'timing'>> = (props) => (
  <HoverSequences {...props} timing="staggered" />
);

export const CascadeHover: React.FC<Omit<HoverSequencesProps, 'timing'>> = (props) => (
  <HoverSequences {...props} timing="cascade" />
);

export const ProximityHover: React.FC<Omit<HoverSequencesProps, 'trigger'>> = (props) => (
  <HoverSequences {...props} trigger="proximity" />
);

export const RadialHover: React.FC<Omit<HoverSequencesProps, 'direction'>> = (props) => (
  <HoverSequences {...props} direction="radial" />
);

export const SpiralHover: React.FC<Omit<HoverSequencesProps, 'direction'>> = (props) => (
  <HoverSequences {...props} direction="spiral" />
);

export default HoverSequences;