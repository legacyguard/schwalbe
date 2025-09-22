import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { config } from '@/lib/env';

interface AdvancedBlendModesProps {
  children?: React.ReactNode;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
  intensity?: 'subtle' | 'moderate' | 'intense' | 'extreme';
  animated?: boolean;
  animationSpeed?: 'slow' | 'normal' | 'fast' | 'ultra';
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onBlendChange?: (blendMode: string, intensity: number) => void;
}

interface BlendEffect {
  mixBlendMode: string;
  filter: string;
  opacity: number;
  transform: string;
  backdropFilter: string;
}

interface BlendPreset {
  name: string;
  blendMode: string;
  intensity: string;
  animationSpeed: string;
  effects: string[];
}

const AdvancedBlendModes: React.FC<AdvancedBlendModesProps> = ({
  children,
  blendMode = 'overlay',
  intensity = 'moderate',
  animated = true,
  animationSpeed = 'normal',
  interactive = true,
  className = '',
  style = {},
  onBlendChange,
}) => {
  const [currentBlendMode, setCurrentBlendMode] = useState(blendMode);
  const [_currentIntensity, _setCurrentIntensity] = useState(intensity);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse position tracking for interactive effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform mouse position to blend effects
  const blendIntensity = useTransform(mouseX, [0, 1], [0.3, 1.0]);
  const saturationBoost = useTransform(mouseX, [0, 1], [1.0, 1.5]);
  const contrastBoost = useTransform(mouseY, [0, 1], [1.0, 1.3]);
  const scaleEffect = useTransform(mouseX, [0, 1], [1, 1.02]);

  // Intensity configurations
  const intensityConfigs = {
    subtle: { opacity: 0.3, saturation: 1.1, contrast: 1.05, blur: 'blur(0px)' },
    moderate: { opacity: 0.6, saturation: 1.2, contrast: 1.1, blur: 'blur(0.5px)' },
    intense: { opacity: 0.8, saturation: 1.4, contrast: 1.2, blur: 'blur(1px)' },
    extreme: { opacity: 1.0, saturation: 1.6, contrast: 1.4, blur: 'blur(2px)' },
  };

  // Animation speed configurations
  const speedConfigs = {
    slow: 10000,
    normal: 6000,
    fast: 3000,
    ultra: 1500,
  };

  const intensityConfig = intensityConfigs[intensity];
  const animationDuration = speedConfigs[animationSpeed];

  /* Predefined blend mode presets (for future use)
  const blendPresets: Record<string, BlendPreset> = {
    cinematic: {
      name: 'Cinematic Drama',
      blendMode: 'overlay',
      intensity: 'intense',
      animationSpeed: 'normal',
      effects: ['overlay', 'saturation', 'contrast'],
    },
    vintage: {
      name: 'Vintage Film',
      blendMode: 'multiply',
      intensity: 'moderate',
      animationSpeed: 'slow',
      effects: ['multiply', 'sepia', 'vignette'],
    },
    neon: {
      name: 'Neon Glow',
      blendMode: 'screen',
      intensity: 'extreme',
      animationSpeed: 'fast',
      effects: ['screen', 'glow', 'bloom'],
    },
    dream: {
      name: 'Dream Sequence',
      blendMode: 'soft-light',
      intensity: 'moderate',
      animationSpeed: 'slow',
      effects: ['soft-light', 'blur', 'desaturate'],
    },
    horror: {
      name: 'Horror Film',
      blendMode: 'color-burn',
      intensity: 'intense',
      animationSpeed: 'normal',
      effects: ['color-burn', 'darken', 'red-shift'],
    },
    sciFi: {
      name: 'Sci-Fi Interface',
      blendMode: 'difference',
      intensity: 'extreme',
      animationSpeed: 'fast',
      effects: ['difference', 'invert', 'chromatic'],
    },
    watercolor: {
      name: 'Watercolor Wash',
      blendMode: 'lighten',
      intensity: 'subtle',
      animationSpeed: 'slow',
      effects: ['lighten', 'blur', 'soften'],
    },
    metallic: {
      name: 'Metallic Sheen',
      blendMode: 'hard-light',
      intensity: 'moderate',
      animationSpeed: 'normal',
      effects: ['hard-light', 'saturation', 'contrast'],
    },
    glitch: {
      name: 'Digital Glitch',
      blendMode: 'exclusion',
      intensity: 'extreme',
      animationSpeed: 'ultra',
      effects: ['exclusion', 'distort', 'pixelate'],
    },
    ethereal: {
      name: 'Ethereal Mist',
      blendMode: 'luminosity',
      intensity: 'subtle',
      animationSpeed: 'slow',
      effects: ['luminosity', 'blur', 'desaturate'],
    },
  };
  */

  // Generate advanced blend effect
  const generateBlendEffect = (): BlendEffect => {
    const interactiveScale = interactive && isHovered ? scaleEffect.get() : 1;
    const interactiveIntensity = interactive && isHovered ? blendIntensity.get() : 1.0;

    // Base blend mode effects
    const blendEffects: Record<string, Partial<BlendEffect>> = {
      normal: { mixBlendMode: 'normal', filter: 'none' },
      multiply: { mixBlendMode: 'multiply', filter: 'contrast(1.1) brightness(0.9)' },
      screen: { mixBlendMode: 'screen', filter: 'contrast(1.2) brightness(1.1)' },
      overlay: { mixBlendMode: 'overlay', filter: 'contrast(1.3) saturate(1.2)' },
      darken: { mixBlendMode: 'darken', filter: 'brightness(0.8)' },
      lighten: { mixBlendMode: 'lighten', filter: 'brightness(1.2)' },
      'color-dodge': { mixBlendMode: 'color-dodge', filter: 'contrast(1.4) brightness(1.3)' },
      'color-burn': { mixBlendMode: 'color-burn', filter: 'contrast(1.5) brightness(0.7)' },
      'hard-light': { mixBlendMode: 'hard-light', filter: 'contrast(1.3) saturate(1.3)' },
      'soft-light': { mixBlendMode: 'soft-light', filter: 'contrast(1.1) saturate(1.1)' },
      difference: { mixBlendMode: 'difference', filter: 'contrast(1.5) hue-rotate(45deg)' },
      exclusion: { mixBlendMode: 'exclusion', filter: 'contrast(1.4) invert(0.1)' },
      hue: { mixBlendMode: 'hue', filter: 'saturate(1.5)' },
      saturation: { mixBlendMode: 'saturation', filter: 'saturate(1.8)' },
      color: { mixBlendMode: 'color', filter: 'saturate(1.6) contrast(1.2)' },
      luminosity: { mixBlendMode: 'luminosity', filter: 'contrast(1.1) brightness(1.05)' },
    };

    const baseEffect = blendEffects[currentBlendMode] || blendEffects.overlay;

    return {
      mixBlendMode: baseEffect?.mixBlendMode || 'overlay',
      filter: `
        ${baseEffect?.filter || 'none'}
        ${intensityConfig.blur}
        saturate(${intensityConfig.saturation * saturationBoost.get() * interactiveIntensity})
        contrast(${intensityConfig.contrast * contrastBoost.get() * interactiveIntensity})
      `.trim(),
      opacity: intensityConfig.opacity * interactiveIntensity,
      transform: `scale(${interactiveScale})`,
      backdropFilter: currentBlendMode === 'overlay' ? 'blur(2px)' : 'none',
    };
  };

  // Animation variants for different blend modes
  const getAnimationVariants = () => {
    const baseDuration = animationDuration * (shouldReduceMotion ? 0.1 : 1);

    return {
      overlay: {
        opacity: [0.6, 1.0, 0.6],
        filter: [
          'contrast(1.3) saturate(1.2)',
          'contrast(1.5) saturate(1.4)',
          'contrast(1.3) saturate(1.2)',
        ],
        transition: {
          duration: baseDuration,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      multiply: {
        opacity: [0.3, 0.8, 0.3],
        filter: [
          'contrast(1.1) brightness(0.9)',
          'contrast(1.3) brightness(0.7)',
          'contrast(1.1) brightness(0.9)',
        ],
        transition: {
          duration: baseDuration * 1.2,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      screen: {
        opacity: [0.6, 1.0, 0.6],
        filter: [
          'contrast(1.2) brightness(1.1)',
          'contrast(1.4) brightness(1.3)',
          'contrast(1.2) brightness(1.1)',
        ],
        transition: {
          duration: baseDuration * 0.8,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      'soft-light': {
        opacity: [0.4, 0.9, 0.4],
        filter: [
          'contrast(1.1) saturate(1.1)',
          'contrast(1.3) saturate(1.3)',
          'contrast(1.1) saturate(1.1)',
        ],
        transition: {
          duration: baseDuration * 1.5,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      difference: {
        filter: [
          'contrast(1.5) hue-rotate(45deg)',
          'contrast(1.7) hue-rotate(90deg)',
          'contrast(1.5) hue-rotate(45deg)',
        ],
        transition: {
          duration: baseDuration * 0.6,
          ease: 'linear',
          repeat: Infinity,
        },
      },
      exclusion: {
        opacity: [0.5, 1.0, 0.5],
        filter: [
          'contrast(1.4) invert(0.1)',
          'contrast(1.6) invert(0.2)',
          'contrast(1.4) invert(0.1)',
        ],
        transition: {
          duration: baseDuration * 0.7,
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

    // Dynamic blend mode based on mouse position
    const centerX = 0.5;
    const centerY = 0.5;
    const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

    if (distanceFromCenter < 0.3) {
      setCurrentBlendMode('soft-light');
    } else if (distanceFromCenter < 0.6) {
      setCurrentBlendMode('overlay');
    } else {
      setCurrentBlendMode('hard-light');
    }

    onBlendChange?.(currentBlendMode, intensityConfig.opacity);
  };

  // Cycle through blend modes
  useEffect(() => {
    if (!animated || shouldReduceMotion) return;

    const blendModes = ['overlay', 'soft-light', 'hard-light', 'multiply', 'screen'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      const nextBlendMode = blendModes[currentIndex] as typeof currentBlendMode;
      if (nextBlendMode) {
        setCurrentBlendMode(nextBlendMode);
      }
      currentIndex = (currentIndex + 1) % blendModes.length;
    }, animationDuration);

    return () => clearInterval(interval);
  }, [animated, shouldReduceMotion, animationDuration]);

  const blendEffect = generateBlendEffect();

  // Dynamic styles
  const dynamicStyles: React.CSSProperties = {
    mixBlendMode: blendEffect.mixBlendMode as any,
    filter: blendEffect.filter,
    opacity: blendEffect.opacity,
    transform: blendEffect.transform,
    backdropFilter: blendEffect.backdropFilter,
    transition: shouldReduceMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };

  return (
    <motion.div
      ref={containerRef}
      className={`advanced-blend-mode ${className}`}
      style={dynamicStyles}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={animated && !shouldReduceMotion ? (getAnimationVariants() as any)[currentBlendMode] ?? getAnimationVariants().overlay : {}}
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
              background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
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
              mixBlendMode: 'screen',
            }}
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 0.4, rotate: 360 }}
            transition={{
              duration: 3,
              ease: 'linear',
              repeat: Infinity,
            }}
          />
        </>
      )}

      {/* Ambient color cycling effect */}
      {animated && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-inherit pointer-events-none opacity-10"
          style={{
            background: `
              linear-gradient(45deg, #ff006e, #8338ec),
              linear-gradient(135deg, #3a86ff, #06ffa5),
              linear-gradient(225deg, #ffbe0b, #ff006e)
            `,
            backgroundSize: '400% 400%',
            mixBlendMode: 'color',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: animationDuration * 0.5,
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
              background: 'inherit',
              filter: 'hue-rotate(2deg) blur(1px)',
              transform: 'translateX(1px)',
              mixBlendMode: 'multiply',
              opacity: 0.2,
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              background: 'inherit',
              filter: 'hue-rotate(-2deg) blur(1px)',
              transform: 'translateX(-1px)',
              mixBlendMode: 'multiply',
              opacity: 0.2,
            }}
          />
        </>
      )}

      {/* Blend mode indicator */}
      {config.isDev && (
        <div className="absolute top-2 right-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          {currentBlendMode} • {intensity}
        </div>
      )}
    </motion.div>
  );
};

// Preset blend mode components for easy usage
export const CinematicBlend: React.FC<Omit<AdvancedBlendModesProps, 'blendMode' | 'intensity' | 'animationSpeed'>> = (props) => (
  <AdvancedBlendModes {...props} blendMode="overlay" intensity="intense" />
);

export const VintageBlend: React.FC<Omit<AdvancedBlendModesProps, 'blendMode' | 'intensity' | 'animationSpeed'>> = (props) => (
  <AdvancedBlendModes {...props} blendMode="multiply" intensity="moderate" />
);

export const NeonBlend: React.FC<Omit<AdvancedBlendModesProps, 'blendMode' | 'intensity' | 'animationSpeed'>> = (props) => (
  <AdvancedBlendModes {...props} blendMode="screen" intensity="extreme" />
);

export const DreamBlend: React.FC<Omit<AdvancedBlendModesProps, 'blendMode' | 'intensity' | 'animationSpeed'>> = (props) => (
  <AdvancedBlendModes {...props} blendMode="soft-light" intensity="moderate" />
);

export const HorrorBlend: React.FC<Omit<AdvancedBlendModesProps, 'blendMode' | 'intensity' | 'animationSpeed'>> = (props) => (
  <AdvancedBlendModes {...props} blendMode="color-burn" intensity="intense" />
);

export const SciFiBlend: React.FC<Omit<AdvancedBlendModesProps, 'blendMode' | 'intensity' | 'animationSpeed'>> = (props) => (
  <AdvancedBlendModes {...props} blendMode="difference" intensity="extreme" />
);

export default AdvancedBlendModes;