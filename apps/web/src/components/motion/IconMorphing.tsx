import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface IconMorphingProps {
  children?: React.ReactNode;
  fromIcon?: 'arrow' | 'check' | 'cross' | 'heart' | 'star' | 'loading' | 'search' | 'menu' | 'close' | 'plus' | 'minus' | 'play' | 'pause' | 'download' | 'upload' | 'edit' | 'delete' | 'share' | 'bookmark' | 'notification' | 'settings' | 'user' | 'lock' | 'unlock' | 'eye' | 'eye-off' | 'thumb-up' | 'thumb-down' | 'fire' | 'water' | 'leaf' | 'sun' | 'moon' | 'cloud' | 'rain' | 'snow' | 'wind' | 'lightning' | 'document' | 'will' | 'guardian' | 'family' | 'security' | 'legacy' | 'time-capsule' | 'emergency' | 'professional' | 'insights' | 'milestones' | 'assets' | 'reminders' | 'sharing' | 'notifications' | 'settings' | 'profile' | 'dashboard' | 'analytics' | 'reports';
  toIcon?: 'arrow' | 'check' | 'cross' | 'heart' | 'star' | 'loading' | 'search' | 'menu' | 'close' | 'plus' | 'minus' | 'play' | 'pause' | 'download' | 'upload' | 'edit' | 'delete' | 'share' | 'bookmark' | 'notification' | 'settings' | 'user' | 'lock' | 'unlock' | 'eye' | 'eye-off' | 'thumb-up' | 'thumb-down' | 'fire' | 'water' | 'leaf' | 'sun' | 'moon' | 'cloud' | 'rain' | 'snow' | 'wind' | 'lightning' | 'document' | 'will' | 'guardian' | 'family' | 'security' | 'legacy' | 'time-capsule' | 'emergency' | 'professional' | 'insights' | 'milestones' | 'assets' | 'reminders' | 'sharing' | 'notifications' | 'settings' | 'profile' | 'dashboard' | 'analytics' | 'reports';
  trigger?: 'hover' | 'click' | 'focus' | 'load' | 'scroll' | 'complete' | 'auto' | 'context' | 'state-change';
  morphType?: 'smooth' | 'elastic' | 'bouncy' | 'liquid' | 'geometric' | 'organic' | 'tech' | 'magical' | 'dramatic' | 'subtle';
  duration?: number;
  delay?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'circIn' | 'circOut' | 'circInOut' | 'backIn' | 'backOut' | 'backInOut' | 'anticipate' | 'ease' | 'gentle' | 'wobbly' | 'stiff' | 'slow' | 'molasses';
  direction?: 'forward' | 'backward' | 'bidirectional' | 'random';
  intensity?: 'subtle' | 'gentle' | 'moderate' | 'strong' | 'intense' | 'extreme';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  loop?: boolean | number;
  onMorphStart?: () => void;
  onMorphComplete?: () => void;
  onStateChange?: (state: string) => void;
}

interface MorphPath {
  from: string;
  to: string;
  controlPoints?: string[];
  animation: string;
  duration: number;
  delay: number;
  easing: string;
}

interface IconMorphData {
  name: string;
  fromIcon: string;
  toIcon: string;
  paths: MorphPath[];
  viewBox: string;
  morphType: string;
  colors: Record<string, string>;
  complexity: string;
}

interface MorphSequence {
  name: string;
  steps: string[];
  duration: number;
  easing: string;
  loop: boolean;
}

const IconMorphing: React.FC<IconMorphingProps> = ({
  children,
  fromIcon = 'arrow',
  toIcon = 'check',
  trigger = 'hover',
  morphType = 'smooth',
  duration = 1000,
  delay = 0,
  easing = 'easeInOut',
  direction = 'forward',
  intensity = 'moderate',
  size = 'md',
  color = '#6b7280',
  strokeWidth = 2,
  className = '',
  style = {},
  disabled = false,
  loop = false,
  onMorphStart,
  onMorphComplete,
  onStateChange,
}) => {
  const [currentIcon, setCurrentIcon] = useState(fromIcon);
  const [isMorphing, setIsMorphing] = useState(false);
  const [morphProgress, setMorphProgress] = useState(0);
  const [showEffects, setShowEffects] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Icon path definitions for morphing
  const iconPaths: Record<string, string[]> = {
    arrow: ['M5 12h14', 'M12 5l7 7-7 7'],
    check: ['M20 6L9 17l-5-5'],
    cross: ['M18 6L6 18', 'M6 6l12 12'],
    heart: ['M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'],
    star: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
    loading: ['M12 2V6', 'M12 18V22', 'M4.93 4.93L7.76 7.76', 'M16.24 16.24L19.07 19.07', 'M2 12H6', 'M18 12H22', 'M4.93 19.07L7.76 16.24', 'M16.24 7.76L19.07 4.93'],
    search: ['M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'],
    menu: ['M3 12h18', 'M3 6h18', 'M3 18h18'],
    close: ['M18 6L6 18', 'M6 6l12 12'],
    plus: ['M12 5v14', 'M5 12h14'],
    minus: ['M5 12h14'],
    play: ['M8 5v14l11-7z'],
    pause: ['M6 4h4v16H6zM14 4h4v16h-4z'],
    download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
    upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
    edit: ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'],
    delete: ['M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 22 16z', 'M9 9l6 6', 'M15 9l-6 6'],
    share: ['M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8', 'M16 6l-4-4-4 4', 'M12 2v13'],
    bookmark: ['M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'],
    notification: ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z', 'M13.73 21a2 2 0 0 1-3.46 0'],
    settings: ['M12 1v6m0 12v6m11-7h-6m-12 0H1m15.5-5.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8z'],
    user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
    lock: ['M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-7c-1.66 0-3 1.34-3 3v2h6v-2c0-1.66-1.34-3-3-3z'],
    unlock: ['M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-7c-1.66 0-3 1.34-3 3v2h6v-2c0-1.66-1.34-3-3-3z', 'M12 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z'],
    eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
    'eye-off': ['M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24', 'M1 1l22 22'],
    'thumb-up': ['M14 10h4.83a2 2 0 0 1 1.92 2.56l-1.5 6A2 2 0 0 1 17.33 20H10a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h4z', 'M2 10h4v12H2z'],
    'thumb-down': ['M10 14H5.17a2 2 0 0 1-1.92-2.56l1.5-6A2 2 0 0 1 6.67 4H14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4z', 'M22 14h-4V2h4z'],
    fire: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
    water: ['M7.5 4.21l.12.12c1.28 1.28 3.37 1.28 4.65 0l.12-.12c1.28-1.28 1.28-3.37 0-4.65L12 0l-.39.39c-1.28 1.28-1.28 3.37 0 4.65z', 'M12 2v20', 'M2 12h20', 'M7 17h10', 'M2 7h20'],
    leaf: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z', 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'],
    sun: ['M12 2v2', 'M12 20v2', 'M4.93 4.93l1.41 1.41', 'M17.66 17.66l1.41 1.41', 'M2 12h2', 'M20 12h2', 'M6.34 17.66l-1.41 1.41', 'M19.07 4.93l-1.41 1.41', 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z'],
    moon: ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'],
    cloud: ['M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z'],
    rain: ['M20 12a8 8 0 1 1-16 0', 'M12 2v10', 'M8 22l4-4 4 4', 'M4 18l4-4 4 4', 'M16 18l4-4 4 4'],
    snow: ['M20 12a8 8 0 1 1-16 0', 'M12 2v10', 'M8 22l4-4 4 4', 'M4 18l4-4 4 4', 'M16 18l4-4 4 4', 'M2 14l4 4 4-4', 'M18 14l4 4 4-4'],
    wind: ['M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2'],
    lightning: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
    document: ['M20 15 L20 85 L80 85 L80 35 L60 15 Z', 'M60 15 L60 35 L80 35', 'M25 25 L70 25', 'M25 35 L65 35', 'M25 45 L75 45', 'M25 55 L60 55'],
    will: ['M15 10 L15 90 L105 90 L105 10 Z', 'M20 15 L20 85 L100 85 L100 15 Z', 'M85 25 Q90 25 90 30 Q90 35 85 35 Q80 35 80 30 Q80 25 85 25', 'M25 70 L75 70', 'M25 40 L90 40', 'M25 45 L85 45'],
    guardian: ['M50 10 L30 20 L30 50 Q30 70 50 90 Q70 70 70 50 L70 20 Z', 'M50 15 L35 25 L35 50 Q35 65 50 80 Q65 65 65 50 L65 25 Z', 'M40 30 L60 30', 'M40 40 L60 40', 'M45 55 L55 55 L55 65 L50 70 L45 65 Z'],
    family: ['M60 80 L60 95', 'M60 75 Q50 65 40 55', 'M60 75 Q70 65 80 55', 'M30 35 Q32 35 32 37 Q32 39 30 39 Q28 39 28 37 Q28 35 30 35', 'M50 35 Q52 35 52 37 Q52 39 50 39 Q48 39 48 37 Q48 35 50 35'],
    security: ['M50 25 Q50 20 45 20 L35 20 Q30 20 30 25 L30 45 Q30 50 35 50 L45 50 Q50 50 50 45 Z', 'M35 20 Q35 15 40 15 L60 15 Q65 15 65 20 L65 25', 'M25 60 L75 60', 'M25 65 L75 65'],
    legacy: ['M60 10 Q60 5 55 5 L65 5 Q60 5 60 10', 'M60 90 Q60 95 55 95 L65 95 Q60 95 60 90', 'M50 15 Q50 10 45 10 L75 10 Q70 10 70 15 L70 45 Q70 50 65 50 L55 50 Q50 50 50 45 Z'],
  };

  // Morph sequence definitions
  const morphSequences: Record<string, MorphSequence> = {
    'arrow-to-check': {
      name: 'Arrow to Check',
      steps: ['arrow', 'check'],
      duration: 800,
      easing: 'easeInOut',
      loop: false,
    },
    'heart-to-star': {
      name: 'Heart to Star',
      steps: ['heart', 'star'],
      duration: 1200,
      easing: 'easeOut',
      loop: false,
    },
    'loading-to-check': {
      name: 'Loading to Success',
      steps: ['loading', 'check'],
      duration: 600,
      easing: 'anticipate',
      loop: false,
    },
    'cross-to-check': {
      name: 'Error to Success',
      steps: ['cross', 'check'],
      duration: 1000,
      easing: 'backOut',
      loop: false,
    },
    'plus-to-minus': {
      name: 'Expand to Collapse',
      steps: ['plus', 'minus'],
      duration: 400,
      easing: 'easeInOut',
      loop: false,
    },
    'play-to-pause': {
      name: 'Play to Pause',
      steps: ['play', 'pause'],
      duration: 500,
      easing: 'easeInOut',
      loop: false,
    },
    'lock-to-unlock': {
      name: 'Lock to Unlock',
      steps: ['lock', 'unlock'],
      duration: 800,
      easing: 'easeInOut',
      loop: false,
    },
    'eye-to-eye-off': {
      name: 'Show to Hide',
      steps: ['eye', 'eye-off'],
      duration: 600,
      easing: 'easeInOut',
      loop: false,
    },
    'thumb-up-to-thumb-down': {
      name: 'Like to Dislike',
      steps: ['thumb-up', 'thumb-down'],
      duration: 700,
      easing: 'easeInOut',
      loop: false,
    },
    'sun-to-moon': {
      name: 'Day to Night',
      steps: ['sun', 'moon'],
      duration: 1500,
      easing: 'easeInOut',
      loop: false,
    },
    'document-to-will': {
      name: 'Document to Will',
      steps: ['document', 'will'],
      duration: 1200,
      easing: 'easeInOut',
      loop: false,
    },
    'guardian-to-family': {
      name: 'Protection to Family',
      steps: ['guardian', 'family'],
      duration: 1000,
      easing: 'easeOut',
      loop: false,
    },
    'security-to-legacy': {
      name: 'Security to Legacy',
      steps: ['security', 'legacy'],
      duration: 1400,
      easing: 'easeInOut',
      loop: false,
    },
  };

  // Get current morph sequence
  const getMorphSequence = useCallback(() => {
    const sequenceKey = `${fromIcon}-to-${toIcon}`;
    return morphSequences[sequenceKey] || {
      name: 'Custom Morph',
      steps: [fromIcon, toIcon],
      duration,
      easing,
      loop: false,
    };
  }, [fromIcon, toIcon, duration, easing]);

  // Morph animation configurations
  const getMorphAnimation = useCallback(() => {
    const baseConfig = {
      duration: duration / 1000,
      ease: easing,
      times: [0, 0.5, 1],
    };

    switch (morphType) {
      case 'smooth':
        return {
          ...baseConfig,
          type: 'tween' as const,
          ease: 'easeInOut',
        };
      case 'elastic':
        return {
          ...baseConfig,
          type: 'spring' as const,
          stiffness: 300,
          damping: 20,
        };
      case 'bouncy':
        return {
          ...baseConfig,
          type: 'spring' as const,
          stiffness: 400,
          damping: 10,
        };
      case 'liquid':
        return {
          ...baseConfig,
          type: 'tween' as const,
          ease: 'circInOut',
        };
      case 'geometric':
        return {
          ...baseConfig,
          type: 'tween' as const,
          ease: 'backInOut',
        };
      case 'organic':
        return {
          ...baseConfig,
          type: 'spring' as const,
          stiffness: 200,
          damping: 25,
        };
      case 'tech':
        return {
          ...baseConfig,
          type: 'tween' as const,
          ease: 'anticipate',
        };
      case 'magical':
        return {
          ...baseConfig,
          type: 'spring' as const,
          stiffness: 150,
          damping: 15,
        };
      case 'dramatic':
        return {
          ...baseConfig,
          type: 'tween' as const,
          ease: 'backOut',
          scale: [1, 1.2, 0.8, 1.1, 1],
        };
      case 'subtle':
        return {
          ...baseConfig,
          type: 'tween' as const,
          ease: 'easeOut',
          scale: [1, 1.05, 1],
        };
      default:
        return baseConfig;
    }
  }, [morphType, duration, easing]);

  // Trigger morph animation
  const triggerMorph = useCallback(() => {
    if (disabled || shouldReduceMotion) return;

    setIsMorphing(true);
    onMorphStart?.();

    // Update current icon
    setCurrentIcon(toIcon);
    setMorphProgress(1);

    // Reset after animation
    const timer = setTimeout(() => {
      setIsMorphing(false);
      setMorphProgress(0);
      onMorphComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [disabled, shouldReduceMotion, toIcon, duration, onMorphStart, onMorphComplete]);

  // Trigger handlers
  const handleMouseEnter = () => {
    if (trigger === 'hover' && !disabled) {
      triggerMorph();
      setShowEffects(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setShowEffects(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click' && !disabled) {
      triggerMorph();
      setShowEffects(!showEffects);
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus' && !disabled) {
      triggerMorph();
    }
  };

  // Auto trigger effect
  useEffect(() => {
    if (trigger === 'auto' && !disabled) {
      const timer = setTimeout(() => {
        triggerMorph();
      }, delay);

      return () => clearTimeout(timer);
    }
    
    return undefined;
  }, [trigger, disabled, delay, triggerMorph]);

  // Size configurations
  const sizeConfigs = {
    xs: { width: 16, height: 16 },
    sm: { width: 20, height: 20 },
    md: { width: 24, height: 24 },
    lg: { width: 32, height: 32 },
    xl: { width: 48, height: 48 },
    custom: { width: 24, height: 24 },
  };

  const currentSize = sizeConfigs[size];
  const morphSequence = getMorphSequence();
  const morphAnimation = getMorphAnimation();

  return (
    <div
      ref={containerRef}
      className={`icon-morphing ${className} ${isMorphing ? 'morphing' : ''} ${currentIcon}`}
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
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color }}
        animate={shouldReduceMotion ? {} : morphAnimation}
        whileHover={shouldReduceMotion ? {} : {
          scale: 1.1,
          rotate: 5,
          transition: { duration: 0.3 },
        }}
        whileTap={shouldReduceMotion ? {} : {
          scale: 0.95,
          transition: { duration: 0.1 },
        }}
      >
        {/* Current icon paths */}
        {((iconPaths[currentIcon] || iconPaths.arrow) || []).map((path, index) => (
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

        {/* Morph effects */}
        <AnimatePresence>
          {showEffects && !shouldReduceMotion && (
            <g>
              {/* Morphing particles */}
              {[...Array(8)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx={Math.random() * 24}
                  cy={Math.random() * 24}
                  r="1"
                  fill={color}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    x: [0, (Math.random() - 0.5) * 20],
                    y: [0, (Math.random() - 0.5) * 20],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1,
                    ease: 'easeOut',
                  }}
                />
              ))}

              {/* Energy waves */}
              <motion.circle
                cx="12"
                cy="12"
                r="8"
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.5, 2],
                  opacity: [0.6, 0.3, 0],
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeOut',
                }}
              />
            </g>
          )}
        </AnimatePresence>
      </motion.svg>

      {/* Morph progress indicator */}
      {isMorphing && (
        <motion.div
          className="morph-progress"
          style={{
            position: 'absolute',
            bottom: '-4px',
            left: '0',
            right: '0',
            height: '2px',
            background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
            borderRadius: '1px',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}

      {/* Development controls */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-6 left-0 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          {fromIcon} → {toIcon} • {morphType} • {intensity}
        </div>
      )}
    </div>
  );
};

// Preset morphing components for easy usage
export const ArrowToCheck: React.FC<Omit<IconMorphingProps, 'fromIcon' | 'toIcon'>> = (props) => (
  <IconMorphing {...props} fromIcon="arrow" toIcon="check" />
);

export const HeartToStar: React.FC<Omit<IconMorphingProps, 'fromIcon' | 'toIcon'>> = (props) => (
  <IconMorphing {...props} fromIcon="heart" toIcon="star" />
);

export const LoadingToCheck: React.FC<Omit<IconMorphingProps, 'fromIcon' | 'toIcon'>> = (props) => (
  <IconMorphing {...props} fromIcon="loading" toIcon="check" />
);

export const CrossToCheck: React.FC<Omit<IconMorphingProps, 'fromIcon' | 'toIcon'>> = (props) => (
  <IconMorphing {...props} fromIcon="cross" toIcon="check" />
);

export const PlusToMinus: React.FC<Omit<IconMorphingProps, 'fromIcon' | 'toIcon'>> = (props) => (
  <IconMorphing {...props} fromIcon="plus" toIcon="minus" />
);

export const PlayToPause: React.FC<Omit<IconMorphingProps, 'fromIcon' | 'toIcon'>> = (props) => (
  <IconMorphing {...props} fromIcon="play" toIcon="pause" />
);

export const LockToUnlock: React.FC<Omit<IconMorphingProps, 'fromIcon' | 'toIcon'>> = (props) => (
  <IconMorphing {...props} fromIcon="lock" toIcon="unlock" />
);

export const EyeToEyeOff: React.FC<Omit<IconMorphingProps, 'fromIcon' | 'toIcon'>> = (props) => (
  <IconMorphing {...props} fromIcon="eye" toIcon="eye-off" />
);

export const SunToMoon: React.FC<Omit<IconMorphingProps, 'fromIcon' | 'toIcon'>> = (props) => (
  <IconMorphing {...props} fromIcon="sun" toIcon="moon" />
);

export const DocumentToWill: React.FC<Omit<IconMorphingProps, 'fromIcon' | 'toIcon'>> = (props) => (
  <IconMorphing {...props} fromIcon="document" toIcon="will" />
);

export const GuardianToFamily: React.FC<Omit<IconMorphingProps, 'fromIcon' | 'toIcon'>> = (props) => (
  <IconMorphing {...props} fromIcon="guardian" toIcon="family" />
);

export const SecurityToLegacy: React.FC<Omit<IconMorphingProps, 'fromIcon' | 'toIcon'>> = (props) => (
  <IconMorphing {...props} fromIcon="security" toIcon="legacy" />
);

export default IconMorphing;