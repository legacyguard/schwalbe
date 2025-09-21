import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface IridescentSurfacesProps {
  children?: React.ReactNode;
  intensity?: 'subtle' | 'moderate' | 'intense' | 'extreme';
  pattern?: 'linear' | 'radial' | 'conic' | 'mesh' | 'wave' | 'spiral';
  colors?: string[];
  animated?: boolean;
  animationSpeed?: 'slow' | 'normal' | 'fast' | 'ultra';
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onShift?: (hue: number, saturation: number, lightness: number) => void;
}

interface IridescentEffect {
  background: string;
  backgroundSize: string;
  backgroundPosition: string;
  filter: string;
  transform: string;
  mixBlendMode: string;
}

interface ColorShift {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
}

interface IridescentPreset {
  name: string;
  colors: string[];
  pattern: string;
  intensity: string;
  animationSpeed: string;
  effects: string[];
}

const IridescentSurfaces: React.FC<IridescentSurfacesProps> = ({
  children,
  intensity = 'moderate',
  pattern = 'linear',
  colors = ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b'],
  animated = true,
  animationSpeed = 'normal',
  interactive = true,
  className = '',
  style = {},
  onShift,
}) => {
  const [currentShift, setCurrentShift] = useState<ColorShift>({ hue: 0, saturation: 100, lightness: 50, alpha: 0.8 });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

  // Mouse position tracking for interactive effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform mouse position to color shifts
  const hueShift = useTransform(mouseX, [0, 1], [0, 360]);
  const saturationShift = useTransform(mouseX, [0, 1], [60, 100]);
  const lightnessShift = useTransform(mouseY, [0, 1], [30, 70]);
  const scaleEffect = useTransform(mouseX, [0, 1], [1, 1.05]);

  // Intensity configurations
  const intensityConfigs = {
    subtle: { multiplier: 0.3, opacity: 0.4, blur: 'blur(0px)' },
    moderate: { multiplier: 0.6, opacity: 0.6, blur: 'blur(1px)' },
    intense: { multiplier: 0.8, opacity: 0.8, blur: 'blur(2px)' },
    extreme: { multiplier: 1.0, opacity: 1.0, blur: 'blur(4px)' },
  };

  // Animation speed configurations
  const speedConfigs = {
    slow: 12000,
    normal: 8000,
    fast: 4000,
    ultra: 2000,
  };

  const intensityConfig = intensityConfigs[intensity];
  const animationDuration = speedConfigs[animationSpeed];

  // Predefined iridescent presets
  const iridescentPresets: Record<string, IridescentPreset> = {
    oilSlick: {
      name: 'Oil Slick',
      colors: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b'],
      pattern: 'radial',
      intensity: 'intense',
      animationSpeed: 'normal',
      effects: ['shift', 'reflect', 'distort'],
    },
    pearl: {
      name: 'Pearl Essence',
      colors: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd'],
      pattern: 'conic',
      intensity: 'subtle',
      animationSpeed: 'slow',
      effects: ['shimmer', 'flow', 'soften'],
    },
    neon: {
      name: 'Neon Dream',
      colors: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b', '#ff4081'],
      pattern: 'linear',
      intensity: 'extreme',
      animationSpeed: 'fast',
      effects: ['pulse', 'glow', 'vibrate'],
    },
    opal: {
      name: 'Opal Fire',
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
      pattern: 'mesh',
      intensity: 'moderate',
      animationSpeed: 'normal',
      effects: ['shift', 'shimmer', 'reflect'],
    },
    mercury: {
      name: 'Liquid Mercury',
      colors: ['#c0c0c0', '#e0e0e0', '#f0f0f0', '#ffffff', '#d0d0d0'],
      pattern: 'wave',
      intensity: 'subtle',
      animationSpeed: 'slow',
      effects: ['flow', 'soften', 'distort'],
    },
    aurora: {
      name: 'Aurora Crystal',
      colors: ['#00d4ff', '#0099cc', '#66ffcc', '#99ff99', '#ccff66'],
      pattern: 'spiral',
      intensity: 'intense',
      animationSpeed: 'normal',
      effects: ['shift', 'glow', 'pulse'],
    },
  };

  // Generate iridescent background based on pattern
  const generateIridescentBackground = (): string => {
    const baseColors = colors.map((color, index) => {
      const hue = (index * 360) / colors.length + currentShift.hue;
      const saturation = Math.max(0, Math.min(100, currentShift.saturation + (index * 10)));
      const lightness = Math.max(0, Math.min(100, currentShift.lightness + (index * 5)));
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });

    switch (pattern) {
      case 'radial':
        return `radial-gradient(circle at 50% 50%, ${baseColors.map((color, index) => `${color} ${(index * 100) / baseColors.length}%`).join(', ')})`;
      case 'conic':
        return `conic-gradient(from 0deg at 50% 50%, ${baseColors.join(', ')})`;
      case 'mesh':
        return `
          radial-gradient(at 40% 20%, ${baseColors[0]} 0px, transparent 50%),
          radial-gradient(at 80% 0%, ${baseColors[1]} 0px, transparent 50%),
          radial-gradient(at 0% 50%, ${baseColors[2]} 0px, transparent 50%),
          radial-gradient(at 80% 50%, ${baseColors[0]} 0px, transparent 50%),
          radial-gradient(at 0% 100%, ${baseColors[1]} 0px, transparent 50%),
          radial-gradient(at 80% 100%, ${baseColors[2]} 0px, transparent 50%)
        `;
      case 'wave':
        return `linear-gradient(45deg, ${baseColors[0]}, ${baseColors[1]}, ${baseColors[2]}, ${baseColors[0]})`;
      case 'spiral':
        return `conic-gradient(from 0deg at 50% 50%, ${baseColors[0]}, ${baseColors[1]} 72deg, ${baseColors[2]} 144deg, ${baseColors[3] || baseColors[0]} 216deg, ${baseColors[4] || baseColors[1]} 288deg, ${baseColors[0]} 360deg)`;
      default:
        return `linear-gradient(45deg, ${baseColors.join(', ')})`;
    }
  };

  // Generate iridescent effect
  const generateIridescentEffect = (): IridescentEffect => {
    const background = generateIridescentBackground();
    const interactiveScale = interactive && isHovered ? scaleEffect.get() : 1;

    return {
      background,
      backgroundSize: animated && !shouldReduceMotion ? '400% 400%' : '100% 100%',
      backgroundPosition: '0% 0%',
      filter: `
        ${intensityConfig.blur}
        saturate(${100 + currentShift.saturation * 0.5}%)
        hue-rotate(${currentShift.hue}deg)
        contrast(${100 + intensityConfig.multiplier * 20}%)
      `.trim(),
      transform: `scale(${interactiveScale})`,
      mixBlendMode: intensity === 'extreme' ? 'multiply' : 'normal',
    };
  };

  // Animation variants for different patterns
  const getAnimationVariants = () => {
    const baseDuration = animationDuration * (shouldReduceMotion ? 0.1 : 1);

    return {
      linear: {
        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        transition: {
          duration: baseDuration,
          ease: 'linear',
          repeat: Infinity,
        },
      },
      radial: {
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7],
        transition: {
          duration: baseDuration * 0.8,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      conic: {
        rotate: [0, 360],
        transition: {
          duration: baseDuration * 1.5,
          ease: 'linear',
          repeat: Infinity,
        },
      },
      mesh: {
        backgroundPosition: ['0% 0%', '50% 50%', '100% 100%', '50% 50%', '0% 0%'],
        transition: {
          duration: baseDuration * 1.2,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      wave: {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: {
          duration: baseDuration * 0.6,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      spiral: {
        rotate: [0, 180, 360],
        scale: [1, 1.05, 1],
        transition: {
          duration: baseDuration * 2,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
    };
  };

  // Mouse move handler for interactive effects
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    mouseX.set(x);
    mouseY.set(y);
    setMousePosition({ x, y });

    // Update color shift based on mouse position
    const newShift: ColorShift = {
      hue: hueShift.get(),
      saturation: saturationShift.get(),
      lightness: lightnessShift.get(),
      alpha: currentShift.alpha,
    };

    setCurrentShift(newShift);
    onShift?.(newShift.hue, newShift.saturation, newShift.lightness);
  };

  // Color shift animation
  useEffect(() => {
    if (!animated || shouldReduceMotion) return;

    const interval = setInterval(() => {
      setCurrentShift(prev => ({
        ...prev,
        hue: (prev.hue + 1) % 360,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [animated, shouldReduceMotion]);

  const iridescentEffect = generateIridescentEffect();

  // Dynamic styles
  const dynamicStyles: React.CSSProperties = {
    background: iridescentEffect.background,
    backgroundSize: iridescentEffect.backgroundSize,
    filter: iridescentEffect.filter,
    transform: iridescentEffect.transform,
    mixBlendMode: iridescentEffect.mixBlendMode as any,
    transition: shouldReduceMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };

  return (
    <motion.div
      ref={containerRef}
      className={`iridescent-surface ${className}`}
      style={dynamicStyles}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={animated && !shouldReduceMotion ? getAnimationVariants()[pattern] : {}}
      whileHover={interactive ? {
        scale: 1.02,
        transition: { duration: 0.3, ease: 'easeOut' },
      } : {}}
    >
      {children}

      {/* Interactive overlay effects */}
      {interactive && isHovered && (
        <>
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
              mixBlendMode: 'overlay',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              background: `conic-gradient(from 0deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, transparent, rgba(255,255,255,0.1), transparent)`,
              filter: 'blur(20px)',
            }}
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 0.6, rotate: 360 }}
            transition={{
              duration: 2,
              ease: 'linear',
              repeat: Infinity,
            }}
          />
        </>
      )}

      {/* Ambient shimmer effect */}
      {animated && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-inherit pointer-events-none opacity-20"
          style={{
            background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.5), transparent)',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: animationDuration * 0.3,
            ease: 'linear',
            repeat: Infinity,
          }}
        />
      )}

      {/* Chromatic aberration effect for extreme intensity */}
      {intensity === 'extreme' && !shouldReduceMotion && (
        <>
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              background: iridescentEffect.background,
              filter: 'hue-rotate(2deg) blur(1px)',
              transform: 'translateX(1px)',
              mixBlendMode: 'multiply',
              opacity: 0.3,
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              background: iridescentEffect.background,
              filter: 'hue-rotate(-2deg) blur(1px)',
              transform: 'translateX(-1px)',
              mixBlendMode: 'multiply',
              opacity: 0.3,
            }}
          />
        </>
      )}
    </motion.div>
  );
};

// Preset iridescent components for easy usage
export const OilSlickSurface: React.FC<Omit<IridescentSurfacesProps, 'colors' | 'pattern' | 'intensity' | 'animationSpeed'>> = (props) => (
  <IridescentSurfaces {...props} colors={['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b']} pattern="radial" intensity="intense" />
);

export const PearlSurface: React.FC<Omit<IridescentSurfacesProps, 'colors' | 'pattern' | 'intensity' | 'animationSpeed'>> = (props) => (
  <IridescentSurfaces {...props} colors={['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd']} pattern="conic" intensity="subtle" />
);

export const NeonSurface: React.FC<Omit<IridescentSurfacesProps, 'colors' | 'pattern' | 'intensity' | 'animationSpeed'>> = (props) => (
  <IridescentSurfaces {...props} colors={['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b', '#ff4081']} pattern="linear" intensity="extreme" />
);

export const OpalSurface: React.FC<Omit<IridescentSurfacesProps, 'colors' | 'pattern' | 'intensity' | 'animationSpeed'>> = (props) => (
  <IridescentSurfaces {...props} colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']} pattern="mesh" intensity="moderate" />
);

export const MercurySurface: React.FC<Omit<IridescentSurfacesProps, 'colors' | 'pattern' | 'intensity' | 'animationSpeed'>> = (props) => (
  <IridescentSurfaces {...props} colors={['#c0c0c0', '#e0e0e0', '#f0f0f0', '#ffffff', '#d0d0d0']} pattern="wave" intensity="subtle" />
);

export default IridescentSurfaces;