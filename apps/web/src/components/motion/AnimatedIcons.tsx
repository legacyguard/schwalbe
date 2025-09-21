import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface AnimatedIconsProps {
  children?: React.ReactNode;
  iconType?: 'arrow' | 'check' | 'cross' | 'heart' | 'star' | 'loading' | 'search' | 'menu' | 'close' | 'plus' | 'minus' | 'play' | 'pause' | 'download' | 'upload' | 'edit' | 'delete' | 'share' | 'bookmark' | 'notification' | 'settings' | 'user' | 'lock' | 'unlock' | 'eye' | 'eye-off' | 'thumb-up' | 'thumb-down' | 'fire' | 'water' | 'leaf' | 'sun' | 'moon' | 'cloud' | 'rain' | 'snow' | 'wind' | 'lightning' | 'custom';
  animation?: 'bounce' | 'pulse' | 'spin' | 'wiggle' | 'float' | 'rotate' | 'scale' | 'flip' | 'morph' | 'draw' | 'reveal' | 'explode' | 'implode' | 'wave' | 'shake' | 'glow' | 'rainbow' | 'typewriter' | 'count' | 'progress' | 'success' | 'error' | 'warning' | 'info' | 'celebration' | 'breathing' | 'magnetic' | 'liquid' | 'elastic' | 'spring';
  trigger?: 'hover' | 'click' | 'focus' | 'load' | 'scroll' | 'complete' | 'auto' | 'context';
  state?: 'default' | 'active' | 'inactive' | 'loading' | 'success' | 'error' | 'warning' | 'disabled' | 'selected' | 'highlighted';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  color?: string;
  duration?: number;
  delay?: number;
  repeat?: number | 'infinite';
  direction?: 'up' | 'down' | 'left' | 'right' | 'clockwise' | 'counterclockwise';
  intensity?: 'subtle' | 'gentle' | 'moderate' | 'strong' | 'intense';
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
  onStateChange?: (state: string) => void;
}

interface IconAnimation {
  name: string;
  iconType: string;
  animation: string;
  trigger: string;
  state: string;
  size: string;
  color: string;
  duration: number;
  delay: number;
  repeat: number | 'infinite';
  direction: string;
  intensity: string;
}

interface IconVariant {
  name: string;
  paths: string[];
  viewBox: string;
  animations: string[];
  colors: Record<string, string>;
}

const AnimatedIcons: React.FC<AnimatedIconsProps> = ({
  children,
  iconType = 'arrow',
  animation = 'bounce',
  trigger = 'hover',
  state = 'default',
  size = 'md',
  color = '#6b7280',
  duration = 1000,
  delay = 0,
  repeat = 1,
  direction = 'down',
  intensity = 'moderate',
  className = '',
  style = {},
  disabled = false,
  onAnimationStart,
  onAnimationComplete,
  onStateChange,
}) => {
  const [currentAnimation, setCurrentAnimation] = useState(animation);
  const [currentState, setCurrentState] = useState(state);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showEffects, setShowEffects] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Icon variant configurations
  const iconVariants: Record<string, IconVariant> = {
    arrow: {
      name: 'Arrow',
      paths: ['M5 12h14', 'M12 5l7 7-7 7'],
      viewBox: '0 0 24 24',
      animations: ['bounce', 'pulse', 'wiggle', 'draw'],
      colors: {
        default: '#6b7280',
        active: '#3b82f6',
        success: '#10b981',
        error: '#ef4444',
      },
    },
    check: {
      name: 'Check',
      paths: ['M20 6L9 17l-5-5'],
      viewBox: '0 0 24 24',
      animations: ['bounce', 'scale', 'draw', 'reveal'],
      colors: {
        default: '#6b7280',
        active: '#10b981',
        success: '#10b981',
        error: '#ef4444',
      },
    },
    cross: {
      name: 'Cross',
      paths: ['M18 6L6 18', 'M6 6l12 12'],
      viewBox: '0 0 24 24',
      animations: ['scale', 'rotate', 'shake', 'implode'],
      colors: {
        default: '#6b7280',
        active: '#ef4444',
        error: '#ef4444',
        warning: '#f59e0b',
      },
    },
    heart: {
      name: 'Heart',
      paths: ['M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'],
      viewBox: '0 0 24 24',
      animations: ['bounce', 'pulse', 'scale', 'glow'],
      colors: {
        default: '#6b7280',
        active: '#ef4444',
        success: '#ec4899',
        error: '#374151',
      },
    },
    star: {
      name: 'Star',
      paths: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
      viewBox: '0 0 24 24',
      animations: ['bounce', 'spin', 'glow', 'rainbow'],
      colors: {
        default: '#6b7280',
        active: '#fbbf24',
        success: '#fbbf24',
        warning: '#f59e0b',
      },
    },
    loading: {
      name: 'Loading',
      paths: ['M12 2V6', 'M12 18V22', 'M4.93 4.93L7.76 7.76', 'M16.24 16.24L19.07 19.07', 'M2 12H6', 'M18 12H22', 'M4.93 19.07L7.76 16.24', 'M16.24 7.76L19.07 4.93'],
      viewBox: '0 0 24 24',
      animations: ['spin', 'pulse', 'wave', 'rotate'],
      colors: {
        default: '#6b7280',
        active: '#3b82f6',
        loading: '#8b5cf6',
        success: '#10b981',
      },
    },
    search: {
      name: 'Search',
      paths: ['M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'],
      viewBox: '0 0 24 24',
      animations: ['pulse', 'wiggle', 'bounce', 'draw'],
      colors: {
        default: '#6b7280',
        active: '#3b82f6',
        focus: '#8b5cf6',
        success: '#10b981',
      },
    },
    menu: {
      name: 'Menu',
      paths: ['M3 12h18', 'M3 6h18', 'M3 18h18'],
      viewBox: '0 0 24 24',
      animations: ['bounce', 'wiggle', 'morph', 'reveal'],
      colors: {
        default: '#6b7280',
        active: '#3b82f6',
        hover: '#8b5cf6',
        disabled: '#9ca3af',
      },
    },
    play: {
      name: 'Play',
      paths: ['M8 5v14l11-7z'],
      viewBox: '0 0 24 24',
      animations: ['bounce', 'pulse', 'scale', 'draw'],
      colors: {
        default: '#6b7280',
        active: '#10b981',
        hover: '#3b82f6',
        disabled: '#9ca3af',
      },
    },
    pause: {
      name: 'Pause',
      paths: ['M6 4h4v16H6zM14 4h4v16h-4z'],
      viewBox: '0 0 24 24',
      animations: ['bounce', 'pulse', 'scale', 'morph'],
      colors: {
        default: '#6b7280',
        active: '#ef4444',
        hover: '#f59e0b',
        disabled: '#9ca3af',
      },
    },
  };

  // Animation configurations
  const animationConfigs = {
    bounce: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.7, 1],
      transition: { duration: 1.5, ease: 'easeInOut' },
    },
    spin: {
      rotate: 360,
      transition: { duration: 1, ease: 'linear' },
    },
    wiggle: {
      rotate: [0, -10, 10, -5, 5, 0],
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
    float: {
      y: [0, -10, 0],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    rotate: {
      rotate: direction === 'clockwise' ? 360 : -360,
      transition: { duration: 1, ease: 'linear' },
    },
    scale: {
      scale: [1, 1.3, 1],
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    flip: {
      rotateY: 180,
      transition: { duration: 0.6, ease: 'easeInOut' },
    },
    morph: {
      scale: [1, 1.1, 0.9, 1.1, 1],
      rotate: [0, 5, -5, 5, 0],
      transition: { duration: 1, ease: 'easeInOut' },
    },
    draw: {
      pathLength: [0, 1],
      opacity: [0, 1],
      transition: { duration: 1.5, ease: 'easeInOut' },
    },
    reveal: {
      scale: [0, 1.2, 1],
      opacity: [0, 1, 1],
      transition: { duration: 0.8, ease: 'easeOut' },
    },
    explode: {
      scale: [1, 1.5, 0],
      opacity: [1, 1, 0],
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    implode: {
      scale: [1, 0.5, 1.2, 1],
      opacity: [1, 0.8, 1, 1],
      transition: { duration: 0.7, ease: 'easeInOut' },
    },
    wave: {
      y: [0, -5, 5, -5, 0],
      x: [0, 2, -2, 2, 0],
      transition: { duration: 1.2, ease: 'easeInOut' },
    },
    shake: {
      x: [0, -3, 3, -3, 3, 0],
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    glow: {
      filter: [
        'drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))',
        'drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))',
        'drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))',
      ],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    rainbow: {
      filter: [
        'hue-rotate(0deg)',
        'hue-rotate(360deg)',
      ],
      transition: { duration: 3, ease: 'linear', repeat: Infinity },
    },
    typewriter: {
      width: ['0%', '100%', '100%'],
      transition: { duration: 2, ease: 'easeInOut', times: [0, 0.7, 1] },
    },
    count: {
      scale: [1, 1.2, 1],
      color: ['#6b7280', '#ef4444', '#6b7280'],
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    progress: {
      pathLength: [0, 1],
      transition: { duration: 1, ease: 'easeInOut' },
    },
    success: {
      scale: [0, 1.2, 1],
      rotate: [180, 0],
      color: ['#6b7280', '#10b981', '#10b981'],
      transition: { duration: 0.8, ease: 'easeOut' },
    },
    error: {
      scale: [1, 1.1, 1],
      rotate: [0, -5, 5, 0],
      color: ['#6b7280', '#ef4444', '#ef4444'],
      transition: { duration: 0.6, ease: 'easeInOut' },
    },
    warning: {
      scale: [1, 1.15, 1],
      rotate: [0, -3, 3, 0],
      color: ['#6b7280', '#f59e0b', '#f59e0b'],
      transition: { duration: 0.7, ease: 'easeInOut' },
    },
    info: {
      scale: [1, 1.1, 1],
      color: ['#6b7280', '#3b82f6', '#3b82f6'],
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    celebration: {
      scale: [1, 1.3, 1],
      rotate: [0, 15, -15, 0],
      color: ['#6b7280', '#ec4899', '#fbbf24', '#10b981', '#6b7280'],
      transition: { duration: 1, ease: 'easeInOut' },
    },
    breathing: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    magnetic: {
      x: [0, 5, -5, 0],
      y: [0, -3, 3, 0],
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
    liquid: {
      borderRadius: ['50%', '30%', '70%', '50%'],
      scale: [1, 1.1, 0.9, 1],
      transition: { duration: 1.5, ease: 'easeInOut' },
    },
    elastic: {
      scale: [1, 1.4, 0.8, 1.2, 1],
      rotate: [0, 10, -10, 5, 0],
      transition: { duration: 1, ease: 'easeOut', type: 'spring', stiffness: 200, damping: 10 },
    },
    spring: {
      scale: [1, 1.3, 0.9, 1.1, 1],
      transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 300, damping: 15 },
    },
  };

  // Get current icon variant
  const currentIcon = iconVariants[iconType] || iconVariants.arrow;

  // Get current animation config
  const currentAnimationConfig = animationConfigs[currentAnimation];

  // Get current color based on state
  const getCurrentColor = useCallback(() => {
    if (!currentIcon) return color;
    const stateColors = currentIcon.colors;
    return stateColors[state] || stateColors.default || color;
  }, [currentIcon, state, color]);

  // Trigger animation
  const triggerAnimation = useCallback(() => {
    if (disabled || shouldReduceMotion) return;

    setIsAnimating(true);
    onAnimationStart?.();

    // Reset animation state after duration
    const timer = setTimeout(() => {
      setIsAnimating(false);
      onAnimationComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [disabled, shouldReduceMotion, duration, onAnimationStart, onAnimationComplete]);

  // State change handler
  const handleStateChange = useCallback((newState: typeof state) => {
    setCurrentState(newState);
    onStateChange?.(newState);

    // Trigger appropriate animation for state change
    if (newState === 'success') setCurrentAnimation('success');
    else if (newState === 'error') setCurrentAnimation('error');
    else if (newState === 'warning') setCurrentAnimation('warning');
    else if (newState === 'active') setCurrentAnimation('bounce');
    else setCurrentAnimation(animation);
  }, [onStateChange, animation]);

  // Trigger handlers
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      triggerAnimation();
      setShowEffects(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setShowEffects(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      triggerAnimation();
      setShowEffects(!showEffects);
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      triggerAnimation();
    }
  };

  // Auto trigger effect
  useEffect(() => {
    if (trigger === 'auto' && !disabled) {
      const timer = setTimeout(() => {
        triggerAnimation();
      }, delay);

      return () => clearTimeout(timer);
    }
    
    // Return undefined for all other code paths
    return undefined;
  }, [trigger, disabled, delay, triggerAnimation]);

  // Size configurations
  const sizeConfigs = {
    xs: { width: 12, height: 12 },
    sm: { width: 16, height: 16 },
    md: { width: 20, height: 20 },
    lg: { width: 24, height: 24 },
    xl: { width: 32, height: 32 },
    custom: { width: 24, height: 24 },
  };

  const currentSize = sizeConfigs[size];

  return (
    <div
      ref={containerRef}
      className={`animated-icon ${className} ${isAnimating ? 'animating' : ''} ${currentState}`}
      style={{
        display: 'inline-block',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
    >
      <motion.svg
        width={currentSize.width}
        height={currentSize.height}
        viewBox={currentIcon?.viewBox || '0 0 24 24'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: getCurrentColor() }}
        animate={shouldReduceMotion ? {} : currentAnimationConfig}
        whileHover={shouldReduceMotion ? {} : {
          scale: 1.1,
          transition: { duration: 0.2 },
        }}
        whileTap={shouldReduceMotion ? {} : {
          scale: 0.95,
          transition: { duration: 0.1 },
        }}
      >
        {(currentIcon?.paths || []).map((path, index) => (
          <motion.path
            key={index}
            d={path}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 1,
              transition: {
                delay: index * 0.1,
                duration: 0.5,
                ease: 'easeInOut',
              },
            }}
          />
        ))}
      </motion.svg>

      {/* Animation effects */}
      <AnimatePresence>
        {showEffects && !shouldReduceMotion && (
          <motion.div
            className="icon-effects"
            style={{
              position: 'absolute',
              inset: '-8px',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Glow effect */}
            <motion.div
              style={{
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${getCurrentColor()}30 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Sparkle effects */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: '3px',
                  height: '3px',
                  background: getCurrentColor(),
                  borderRadius: '50%',
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 40],
                  y: [0, (Math.random() - 0.5) * 40],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* State indicator */}
      {currentState !== 'default' && (
        <motion.div
          className="state-indicator"
          style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: getCurrentColor(),
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Development controls */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-6 left-0 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          {iconType} • {currentAnimation} • {currentState}
        </div>
      )}
    </div>
  );
};

// Preset animated icon components for easy usage
export const AnimatedArrow: React.FC<Omit<AnimatedIconsProps, 'iconType'>> = (props) => (
  <AnimatedIcons {...props} iconType="arrow" />
);

export const AnimatedCheck: React.FC<Omit<AnimatedIconsProps, 'iconType'>> = (props) => (
  <AnimatedIcons {...props} iconType="check" />
);

export const AnimatedHeart: React.FC<Omit<AnimatedIconsProps, 'iconType'>> = (props) => (
  <AnimatedIcons {...props} iconType="heart" />
);

export const AnimatedStar: React.FC<Omit<AnimatedIconsProps, 'iconType'>> = (props) => (
  <AnimatedIcons {...props} iconType="star" />
);

export const AnimatedLoading: React.FC<Omit<AnimatedIconsProps, 'iconType'>> = (props) => (
  <AnimatedIcons {...props} iconType="loading" />
);

export const AnimatedSearch: React.FC<Omit<AnimatedIconsProps, 'iconType'>> = (props) => (
  <AnimatedIcons {...props} iconType="search" />
);

export const AnimatedMenu: React.FC<Omit<AnimatedIconsProps, 'iconType'>> = (props) => (
  <AnimatedIcons {...props} iconType="menu" />
);

export const AnimatedPlay: React.FC<Omit<AnimatedIconsProps, 'iconType'>> = (props) => (
  <AnimatedIcons {...props} iconType="play" />
);

export const AnimatedPause: React.FC<Omit<AnimatedIconsProps, 'iconType'>> = (props) => (
  <AnimatedIcons {...props} iconType="pause" />
);

export default AnimatedIcons;