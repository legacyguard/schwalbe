import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface HapticFeedbackProps {
  children?: React.ReactNode;
  type?: 'tap' | 'press' | 'swipe' | 'drag' | 'pinch' | 'rotate' | 'impact' | 'notification';
  intensity?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
  duration?: number;
  scale?: number;
  rippleColor?: string;
  rippleOpacity?: number;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onHapticStart?: () => void;
  onHapticEnd?: () => void;
}

interface HapticPattern {
  name: string;
  type: string;
  intensity: string;
  duration: number;
  scale: number;
  rippleColor: string;
  rippleOpacity: number;
  effects: string[];
}

const HapticFeedback: React.FC<HapticFeedbackProps> = ({
  children,
  type = 'tap',
  intensity = 'medium',
  duration = 300,
  scale = 0.95,
  rippleColor = 'rgba(255, 255, 255, 0.6)',
  rippleOpacity = 0.6,
  className = '',
  style = {},
  disabled = false,
  onHapticStart,
  onHapticEnd,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const [showRipple, setShowRipple] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

  // Motion values for haptic effects
  const scaleValue = useMotionValue(1);
  const rotateValue = useMotionValue(0);
  const brightnessValue = useMotionValue(1);
  const saturateValue = useMotionValue(1);

  // Transform motion values to haptic feedback
  const hapticScale = useTransform(scaleValue, [0.8, 1.2], [0.8, 1.2]);
  const hapticRotate = useTransform(rotateValue, [-5, 5], [-5, 5]);
  const hapticBrightness = useTransform(brightnessValue, [0.7, 1.3], [0.7, 1.3]);
  const hapticSaturate = useTransform(saturateValue, [0.8, 1.2], [0.8, 1.2]);

  // Haptic pattern configurations
  const hapticPatterns: Record<string, HapticPattern> = {
    tap: {
      name: 'Tap Feedback',
      type: 'tap',
      intensity: 'medium',
      duration: 150,
      scale: 0.95,
      rippleColor: 'rgba(255, 255, 255, 0.6)',
      rippleOpacity: 0.6,
      effects: ['scale', 'brightness', 'ripple'],
    },
    press: {
      name: 'Press Feedback',
      type: 'press',
      intensity: 'heavy',
      duration: 200,
      scale: 0.9,
      rippleColor: 'rgba(255, 255, 255, 0.4)',
      rippleOpacity: 0.4,
      effects: ['scale', 'brightness', 'saturate', 'rotate'],
    },
    swipe: {
      name: 'Swipe Feedback',
      type: 'swipe',
      intensity: 'light',
      duration: 100,
      scale: 0.98,
      rippleColor: 'rgba(255, 255, 255, 0.3)',
      rippleOpacity: 0.3,
      effects: ['scale', 'brightness'],
    },
    drag: {
      name: 'Drag Feedback',
      type: 'drag',
      intensity: 'medium',
      duration: 250,
      scale: 0.92,
      rippleColor: 'rgba(255, 255, 255, 0.5)',
      rippleOpacity: 0.5,
      effects: ['scale', 'brightness', 'saturate'],
    },
    pinch: {
      name: 'Pinch Feedback',
      type: 'pinch',
      intensity: 'heavy',
      duration: 180,
      scale: 0.88,
      rippleColor: 'rgba(255, 255, 255, 0.7)',
      rippleOpacity: 0.7,
      effects: ['scale', 'brightness', 'saturate', 'rotate'],
    },
    rotate: {
      name: 'Rotate Feedback',
      type: 'rotate',
      intensity: 'medium',
      duration: 200,
      scale: 0.93,
      rippleColor: 'rgba(255, 255, 255, 0.5)',
      rippleOpacity: 0.5,
      effects: ['scale', 'rotate', 'brightness'],
    },
    impact: {
      name: 'Impact Feedback',
      type: 'impact',
      intensity: 'heavy',
      duration: 120,
      scale: 0.85,
      rippleColor: 'rgba(255, 255, 255, 0.8)',
      rippleOpacity: 0.8,
      effects: ['scale', 'brightness', 'saturate', 'rotate'],
    },
    notification: {
      name: 'Notification Feedback',
      type: 'notification',
      intensity: 'light',
      duration: 300,
      scale: 1.02,
      rippleColor: 'rgba(255, 255, 255, 0.4)',
      rippleOpacity: 0.4,
      effects: ['scale', 'brightness', 'pulse'],
    },
  };

  // Intensity configurations
  const intensityConfigs = {
    light: {
      scale: 0.98,
      brightness: 1.1,
      saturate: 1.05,
      rotate: 1,
      duration: 100,
    },
    medium: {
      scale: 0.95,
      brightness: 1.2,
      saturate: 1.1,
      rotate: 2,
      duration: 150,
    },
    heavy: {
      scale: 0.9,
      brightness: 1.3,
      saturate: 1.2,
      rotate: 3,
      duration: 200,
    },
    rigid: {
      scale: 0.85,
      brightness: 1.4,
      saturate: 1.3,
      rotate: 4,
      duration: 120,
    },
    soft: {
      scale: 0.96,
      brightness: 1.15,
      saturate: 1.08,
      rotate: 1.5,
      duration: 250,
    },
  };

  const currentPattern = hapticPatterns[type];
  const intensityConfig = intensityConfigs[intensity];

  // Generate haptic feedback effect
  const triggerHapticFeedback = async (event?: React.MouseEvent | React.TouchEvent) => {
    if (disabled || shouldReduceMotion) return;

    setIsActive(true);
    onHapticStart?.();

    // Calculate ripple position
    if (event && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'touches' in event ? event.touches[0]?.clientX || event.changedTouches[0]?.clientX || 0 : event.clientX;
      const clientY = 'touches' in event ? event.touches[0]?.clientY || event.changedTouches[0]?.clientY || 0 : event.clientY;

      setRipplePosition({
        x: ((clientX - rect.left) / rect.width) * 100,
        y: ((clientY - rect.top) / rect.height) * 100,
      });
      setShowRipple(true);
    }

    // Apply haptic transformations
    const hapticDuration = duration || intensityConfig.duration;

    await controls.start({
      scale: [1, intensityConfig.scale, 1],
      rotate: [0, intensityConfig.rotate, 0],
      filter: [
        'brightness(1) saturate(1)',
        `brightness(${intensityConfig.brightness}) saturate(${intensityConfig.saturate})`,
        'brightness(1) saturate(1)',
      ],
      transition: {
        duration: hapticDuration / 1000,
        ease: 'easeOut',
        times: [0, 0.3, 1],
      },
    });

    // Hide ripple after animation
    setTimeout(() => {
      setShowRipple(false);
      setIsActive(false);
      onHapticEnd?.();
    }, hapticDuration);
  };

  // Touch event handlers
  const handleTouchStart = (event: React.TouchEvent) => {
    if (disabled) return;
    triggerHapticFeedback(event);
  };

  const handleTouchEnd = () => {
    if (disabled) return;
    // Touch feedback is handled in touchStart for immediate response
  };

  // Mouse event handlers
  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled) return;
    triggerHapticFeedback(event);
  };

  const handleMouseUp = () => {
    if (disabled) return;
    // Mouse feedback is handled in mouseDown for immediate response
  };

  // Keyboard event handlers for accessibility
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled || event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    triggerHapticFeedback();
  };

  // Dynamic styles based on haptic state
  const dynamicStyles: React.CSSProperties = {
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
    WebkitTapHighlightColor: 'transparent',
    transition: shouldReduceMotion ? 'none' : 'transform 0.1s ease-out',
    ...style,
  };

  return (
    <motion.div
      ref={containerRef}
      className={`haptic-feedback ${className} ${isActive ? 'haptic-active' : ''}`}
      style={dynamicStyles}
      animate={controls}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`${currentPattern?.name || 'Haptic Feedback'} - ${intensity} intensity`}
    >
      {children}

      {/* Visual ripple effect */}
      {showRipple && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-inherit pointer-events-none overflow-hidden"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, rippleOpacity, 0],
            scale: [0, 2, 2],
          }}
          transition={{
            duration: (duration || intensityConfig.duration) / 1000,
            ease: 'easeOut',
            times: [0, 0.3, 1],
          }}
          style={{
            background: `radial-gradient(circle at ${ripplePosition.x}% ${ripplePosition.y}%, ${rippleColor} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Impact rings for heavy feedback */}
      {type === 'impact' && isActive && !shouldReduceMotion && (
        <>
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none border-2 border-white"
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ borderColor: rippleColor }}
          />
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none border border-white"
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            style={{ borderColor: rippleColor }}
          />
        </>
      )}

      {/* Pulse effect for notifications */}
      {type === 'notification' && isActive && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-inherit pointer-events-none bg-white"
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: [0, 0.3, 0],
            scale: [1, 1.1, 1.2],
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
            times: [0, 0.3, 1],
          }}
          style={{ backgroundColor: rippleColor }}
        />
      )}

      {/* Shimmer effect for swipe gestures */}
      {type === 'swipe' && isActive && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-inherit pointer-events-none"
          initial={{ opacity: 0, x: '-100%' }}
          animate={{ opacity: [0, 0.6, 0], x: '100%' }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{
            background: `linear-gradient(90deg, transparent, ${rippleColor}, transparent)`,
          }}
        />
      )}

      {/* Particle burst effect for heavy impacts */}
      {type === 'impact' && isActive && !shouldReduceMotion && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full pointer-events-none"
              initial={{
                opacity: 1,
                scale: 1,
                x: '50%',
                y: '50%',
              }}
              animate={{
                opacity: 0,
                scale: 0,
                x: `${50 + (Math.random() - 0.5) * 100}%`,
                y: `${50 + (Math.random() - 0.5) * 100}%`,
              }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
                delay: i * 0.05,
              }}
              style={{
                backgroundColor: rippleColor,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </>
      )}

      {/* Accessibility indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-6 left-0 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          {type} • {intensity}
        </div>
      )}
    </motion.div>
  );
};

// Preset haptic feedback components for easy usage
export const TapHaptic: React.FC<Omit<HapticFeedbackProps, 'type'>> = (props) => (
  <HapticFeedback {...props} type="tap" />
);

export const PressHaptic: React.FC<Omit<HapticFeedbackProps, 'type'>> = (props) => (
  <HapticFeedback {...props} type="press" />
);

export const SwipeHaptic: React.FC<Omit<HapticFeedbackProps, 'type'>> = (props) => (
  <HapticFeedback {...props} type="swipe" />
);

export const ImpactHaptic: React.FC<Omit<HapticFeedbackProps, 'type'>> = (props) => (
  <HapticFeedback {...props} type="impact" />
);

export const NotificationHaptic: React.FC<Omit<HapticFeedbackProps, 'type'>> = (props) => (
  <HapticFeedback {...props} type="notification" />
);

export default HapticFeedback;