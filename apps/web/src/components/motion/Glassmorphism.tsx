import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface GlassmorphismProps {
  children?: React.ReactNode;
  blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  opacity?: number;
  border?: boolean;
  borderWidth?: 'thin' | 'normal' | 'thick';
  borderOpacity?: number;
  background?: 'light' | 'dark' | 'auto';
  interactive?: boolean;
  animated?: boolean;
  animationIntensity?: 'subtle' | 'moderate' | 'intense';
  className?: string;
  style?: React.CSSProperties;
  onHover?: (isHovered: boolean) => void;
  onFocus?: (isFocused: boolean) => void;
}

interface GlassEffect {
  backdropFilter: string;
  background: string;
  border: string;
  boxShadow: string;
  transform: string;
}

interface GlassPreset {
  name: string;
  blur: string;
  opacity: number;
  borderWidth: string;
  borderOpacity: number;
  background: string;
  animationType: 'float' | 'breathe' | 'pulse' | 'glow' | 'morph';
}

const Glassmorphism: React.FC<GlassmorphismProps> = ({
  children,
  blur = 'lg',
  opacity = 0.7,
  border = true,
  borderWidth = 'normal',
  borderOpacity = 0.3,
  background = 'auto',
  interactive = true,
  animated = true,
  animationIntensity = 'moderate',
  className = '',
  style = {},
  onHover,
  onFocus,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

  // Mouse position tracking for interactive effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform mouse position to glass effects
  const blurIntensity = useTransform(mouseX, [0, 1], [0, 10]);
  const glowIntensity = useTransform(mouseX, [0, 1], [0, 0.5]);
  const scaleEffect = useTransform(mouseX, [0, 1], [1, 1.02]);

  // Blur configurations
  const blurConfigs = {
    none: 'blur(0px)',
    sm: 'blur(4px)',
    md: 'blur(8px)',
    lg: 'blur(16px)',
    xl: 'blur(24px)',
    '2xl': 'blur(40px)',
    '3xl': 'blur(64px)',
  };

  // Border width configurations
  const borderWidthConfigs = {
    thin: '1px',
    normal: '1px',
    thick: '2px',
  };

  // Animation intensity multipliers
  const intensityMultipliers = {
    subtle: 0.3,
    moderate: 0.6,
    intense: 1.0,
  };

  const intensity = intensityMultipliers[animationIntensity];

  // Background configurations
  const backgroundConfigs = {
    light: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.1)',
    auto: 'rgba(255, 255, 255, 0.05)',
  };

  // Predefined glass presets
  const glassPresets: Record<string, GlassPreset> = {
    subtle: {
      name: 'Subtle Glass',
      blur: 'blur(8px)',
      opacity: 0.6,
      borderWidth: '1px',
      borderOpacity: 0.2,
      background: 'rgba(255, 255, 255, 0.05)',
      animationType: 'breathe',
    },
    frosted: {
      name: 'Frosted Glass',
      blur: 'blur(16px)',
      opacity: 0.8,
      borderWidth: '1px',
      borderOpacity: 0.3,
      background: 'rgba(255, 255, 255, 0.1)',
      animationType: 'float',
    },
    crystal: {
      name: 'Crystal Glass',
      blur: 'blur(24px)',
      opacity: 0.9,
      borderWidth: '2px',
      borderOpacity: 0.4,
      background: 'rgba(255, 255, 255, 0.15)',
      animationType: 'glow',
    },
    opaque: {
      name: 'Opaque Glass',
      blur: 'blur(32px)',
      opacity: 0.95,
      borderWidth: '1px',
      borderOpacity: 0.5,
      background: 'rgba(255, 255, 255, 0.2)',
      animationType: 'pulse',
    },
    ethereal: {
      name: 'Ethereal Glass',
      blur: 'blur(40px)',
      opacity: 0.7,
      borderWidth: '1px',
      borderOpacity: 0.2,
      background: 'rgba(255, 255, 255, 0.08)',
      animationType: 'morph',
    },
    metallic: {
      name: 'Metallic Glass',
      blur: 'blur(12px)',
      opacity: 0.85,
      borderWidth: '2px',
      borderOpacity: 0.6,
      background: 'rgba(255, 255, 255, 0.12)',
      animationType: 'breathe',
    },
  };

  // Generate glass effect styles
  const generateGlassEffect = (): GlassEffect => {
    const backdropFilter = blurConfigs[blur];
    const bgColor = backgroundConfigs[background];
    const borderStyle = border
      ? `${borderWidthConfigs[borderWidth]} solid rgba(255, 255, 255, ${borderOpacity})`
      : 'none';

    // Interactive adjustments
    const interactiveBlur = interactive && isHovered
      ? blurIntensity.get() * intensity
      : 0;

    const interactiveGlow = interactive && isHovered
      ? glowIntensity.get() * intensity
      : 0;

    const interactiveScale = interactive && isHovered
      ? scaleEffect.get()
      : 1;

    return {
      backdropFilter: `${backdropFilter} saturate(180%)`,
      background: `linear-gradient(135deg, ${bgColor.replace('0.05', (opacity + interactiveGlow).toString())}, ${bgColor.replace('0.05', (opacity - 0.05 + interactiveGlow).toString())})`,
      border: borderStyle,
      boxShadow: `
        0 8px 32px rgba(31, 38, 135, 0.37),
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        ${interactive && isHovered ? `0 0 40px rgba(255, 255, 255, ${interactiveGlow})` : ''}
      `.trim(),
      transform: `scale(${interactiveScale})`,
    };
  };

  // Animation variants
  const getAnimationVariants = () => {
    const baseDuration = 4 * (shouldReduceMotion ? 0.1 : 1);

    return {
      breathe: {
        scale: [1, 1.02, 1],
        opacity: [opacity, opacity + 0.1, opacity],
        transition: {
          duration: baseDuration,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      float: {
        y: [0, -10, 0],
        rotate: [0, 1, 0],
        transition: {
          duration: baseDuration * 1.2,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      pulse: {
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 8px 32px rgba(31, 38, 135, 0.37)',
          '0 8px 32px rgba(31, 38, 135, 0.6)',
          '0 8px 32px rgba(31, 38, 135, 0.37)',
        ],
        transition: {
          duration: baseDuration * 0.8,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      glow: {
        boxShadow: [
          '0 8px 32px rgba(31, 38, 135, 0.37)',
          '0 8px 32px rgba(31, 38, 135, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          '0 8px 32px rgba(31, 38, 135, 0.37)',
        ],
        transition: {
          duration: baseDuration * 1.5,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      morph: {
        borderRadius: ['16px', '24px', '16px', '8px', '16px'],
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
  };

  // Focus handlers
  const handleFocus = (event: React.FocusEvent) => {
    setIsFocused(true);
    onFocus?.(true);
  };

  const handleBlur = (event: React.FocusEvent) => {
    setIsFocused(false);
    onFocus?.(false);
  };

  const glassEffect = generateGlassEffect();

  // Dynamic styles
  const dynamicStyles: React.CSSProperties = {
    backdropFilter: glassEffect.backdropFilter,
    WebkitBackdropFilter: glassEffect.backdropFilter,
    background: glassEffect.background,
    border: glassEffect.border,
    boxShadow: glassEffect.boxShadow,
    borderRadius: '16px',
    transition: shouldReduceMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: glassEffect.transform,
    ...style,
  };

  return (
    <motion.div
      ref={containerRef}
      className={`glassmorphism ${className}`}
      style={dynamicStyles}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onHover?.(false);
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      animate={animated && !shouldReduceMotion ? getAnimationVariants()[blur === 'lg' ? 'breathe' : 'float'] : {}}
      whileHover={interactive ? {
        scale: 1.02,
        transition: { duration: 0.3, ease: 'easeOut' },
      } : {}}
      whileFocus={{
        scale: 1.02,
        boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.5)',
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      tabIndex={interactive ? 0 : -1}
      role={interactive ? 'button' : undefined}
    >
      {children}

      {/* Interactive glow overlay */}
      {interactive && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-[16px] pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
            mixBlendMode: 'overlay',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Focus ring */}
      {isFocused && (
        <motion.div
          className="absolute inset-0 rounded-[16px] pointer-events-none"
          style={{
            boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.5)',
            zIndex: 10,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Ambient light effect */}
      {animated && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-[16px] pointer-events-none opacity-30"
          style={{
            background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 6,
            ease: 'linear',
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
};

// Preset glassmorphism components for easy usage
export const SubtleGlass: React.FC<Omit<GlassmorphismProps, 'blur' | 'opacity' | 'borderOpacity' | 'animationType'>> = (props) => (
  <Glassmorphism {...props} blur="md" opacity={0.6} borderOpacity={0.2} />
);

export const FrostedGlass: React.FC<Omit<GlassmorphismProps, 'blur' | 'opacity' | 'borderOpacity' | 'animationType'>> = (props) => (
  <Glassmorphism {...props} blur="lg" opacity={0.8} borderOpacity={0.3} />
);

export const CrystalGlass: React.FC<Omit<GlassmorphismProps, 'blur' | 'opacity' | 'borderWidth' | 'borderOpacity' | 'animationType'>> = (props) => (
  <Glassmorphism {...props} blur="xl" opacity={0.9} borderWidth="thick" borderOpacity={0.4} />
);

export const OpaqueGlass: React.FC<Omit<GlassmorphismProps, 'blur' | 'opacity' | 'borderOpacity' | 'animationType'>> = (props) => (
  <Glassmorphism {...props} blur="2xl" opacity={0.95} borderOpacity={0.5} />
);

export const EtherealGlass: React.FC<Omit<GlassmorphismProps, 'blur' | 'opacity' | 'borderOpacity' | 'animationType'>> = (props) => (
  <Glassmorphism {...props} blur="3xl" opacity={0.7} borderOpacity={0.2} />
);

export default Glassmorphism;