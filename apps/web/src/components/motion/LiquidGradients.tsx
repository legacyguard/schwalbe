import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface LiquidGradientsProps {
  children?: React.ReactNode;
  gradientType?: 'linear' | 'radial' | 'conic' | 'mesh';
  colors?: string[];
  stops?: number[];
  angle?: number;
  animated?: boolean;
  animationDuration?: number;
  animationIntensity?: 'subtle' | 'moderate' | 'intense';
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onGradientChange?: (colors: string[], angle: number) => void;
}

interface GradientStop {
  color: string;
  position: number;
  opacity: number;
}

interface GradientPreset {
  name: string;
  colors: string[];
  stops: number[];
  angle: number;
  animationType: 'flow' | 'shift' | 'pulse' | 'wave' | 'morph';
}

const LiquidGradients: React.FC<LiquidGradientsProps> = ({
  children,
  gradientType = 'linear',
  colors = ['#667eea', '#764ba2', '#f093fb'],
  stops = [0, 50, 100],
  angle = 45,
  animated = true,
  animationDuration = 8,
  animationIntensity = 'moderate',
  interactive = false,
  className = '',
  style = {},
  onGradientChange,
}) => {
  const [currentColors, setCurrentColors] = useState(colors);
  const [currentAngle, setCurrentAngle] = useState(angle);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

  // Mouse position tracking for interactive gradients
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform mouse position to gradient properties
  const gradientX = useTransform(mouseX, [0, 1], [-50, 50]);
  const gradientY = useTransform(mouseY, [0, 1], [-50, 50]);
  const hueRotation = useTransform(mouseX, [0, 1], [0, 360]);

  // Animation intensity multipliers
  const intensityMultipliers = {
    subtle: 0.3,
    moderate: 0.6,
    intense: 1.0,
  };

  const intensity = intensityMultipliers[animationIntensity];

  // Predefined gradient presets
  const gradientPresets: Record<string, GradientPreset> = {
    sunset: {
      name: 'Sunset Dreams',
      colors: ['#ff9a9e', '#fecfef', '#fecfef'],
      stops: [0, 50, 100],
      angle: 45,
      animationType: 'flow',
    },
    ocean: {
      name: 'Ocean Depths',
      colors: ['#667eea', '#764ba2', '#f093fb'],
      stops: [0, 50, 100],
      angle: 135,
      animationType: 'wave',
    },
    aurora: {
      name: 'Aurora Borealis',
      colors: ['#00d2ff', '#3a7bd5', '#a8edea', '#fed6e3'],
      stops: [0, 33, 66, 100],
      angle: 90,
      animationType: 'morph',
    },
    fire: {
      name: 'Eternal Flame',
      colors: ['#ff416c', '#ff4b2b', '#ff8a00'],
      stops: [0, 50, 100],
      angle: 45,
      animationType: 'pulse',
    },
    forest: {
      name: 'Enchanted Forest',
      colors: ['#134e5e', '#71b280', '#a8e6cf'],
      stops: [0, 50, 100],
      angle: 135,
      animationType: 'shift',
    },
    galaxy: {
      name: 'Cosmic Nebula',
      colors: ['#4facfe', '#00f2fe', '#a8edea', '#fed6e3'],
      stops: [0, 33, 66, 100],
      angle: 90,
      animationType: 'morph',
    },
    rose: {
      name: 'Rose Garden',
      colors: ['#fa709a', '#fee140', '#ff9a9e'],
      stops: [0, 50, 100],
      angle: 45,
      animationType: 'flow',
    },
    ice: {
      name: 'Arctic Ice',
      colors: ['#a8edea', '#fed6e3', '#ff9a9e'],
      stops: [0, 50, 100],
      angle: 135,
      animationType: 'wave',
    },
    lava: {
      name: 'Volcanic Flow',
      colors: ['#f093fb', '#f5576c', '#4facfe'],
      stops: [0, 50, 100],
      angle: 45,
      animationType: 'pulse',
    },
    emerald: {
      name: 'Emerald Dream',
      colors: ['#11998e', '#38ef7d', '#a8edea'],
      stops: [0, 50, 100],
      angle: 135,
      animationType: 'shift',
    },
  };

  // Generate gradient stops with opacity variations
  const generateGradientStops = (): GradientStop[] => {
    return currentColors.map((color, index) => ({
      color,
      position: stops[index] || (index * 100) / (currentColors.length - 1),
      opacity: animated && !shouldReduceMotion ? 0.8 + Math.sin(Date.now() * 0.001 + index) * 0.2 : 1,
    }));
  };

  // Create CSS gradient string
  const createGradientString = (): string => {
    const gradientStops = generateGradientStops();
    const interactiveAngle = interactive && isHovered ? currentAngle + (gradientX.get() * 0.1) : currentAngle;

    switch (gradientType) {
      case 'radial':
        return `radial-gradient(circle at ${50 + gradientX.get() * 0.1}% ${50 + gradientY.get() * 0.1}%, ${gradientStops.map(stop => `${stop.color} ${stop.position}%`).join(', ')})`;
      case 'conic':
        return `conic-gradient(from ${interactiveAngle}deg at 50% 50%, ${gradientStops.map(stop => `${stop.color} ${stop.position}%`).join(', ')})`;
      case 'mesh':
        return `radial-gradient(at 40% 20%, ${gradientStops[0]?.color} 0px, transparent 50%),
                radial-gradient(at 80% 0%, ${gradientStops[1]?.color} 0px, transparent 50%),
                radial-gradient(at 0% 50%, ${gradientStops[2]?.color} 0px, transparent 50%),
                radial-gradient(at 80% 50%, ${gradientStops[0]?.color} 0px, transparent 50%),
                radial-gradient(at 0% 100%, ${gradientStops[1]?.color} 0px, transparent 50%),
                radial-gradient(at 80% 100%, ${gradientStops[2]?.color} 0px, transparent 50%),
                radial-gradient(at 0% 0%, ${gradientStops[0]?.color} 0px, transparent 50%)`;
      default:
        return `linear-gradient(${interactiveAngle}deg, ${gradientStops.map(stop => `${stop.color} ${stop.position}%`).join(', ')})`;
    }
  };

  // Animation variants for different gradient types
  const getAnimationVariants = () => {
    const baseDuration = animationDuration * (shouldReduceMotion ? 0.1 : 1);

    return {
      flow: {
        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        transition: {
          duration: baseDuration,
          ease: 'linear',
          repeat: Infinity,
        },
      },
      shift: {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: {
          duration: baseDuration * 0.8,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      pulse: {
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8],
        transition: {
          duration: baseDuration * 0.6,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      wave: {
        backgroundPosition: ['0% 0%', '50% 50%', '100% 100%', '50% 50%', '0% 0%'],
        transition: {
          duration: baseDuration * 1.2,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
      morph: {
        borderRadius: ['0%', '50%', '25%', '0%'],
        rotate: [0, 180, 360],
        transition: {
          duration: baseDuration * 1.5,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
    };
  };

  // Mouse move handler for interactive gradients
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    mouseX.set(x);
    mouseY.set(y);
    setMousePosition({ x, y });
  };

  // Dynamic styles
  const dynamicStyles: React.CSSProperties = {
    background: createGradientString(),
    backgroundSize: animated && !shouldReduceMotion ? '400% 400%' : '100% 100%',
    transition: shouldReduceMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: interactive ? 'pointer' : 'default',
    ...style,
  };

  return (
    <motion.div
      ref={containerRef}
      className={`liquid-gradient ${className}`}
      style={dynamicStyles}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={animated && !shouldReduceMotion ? getAnimationVariants()[gradientType === 'linear' ? 'flow' : 'morph'] : {}}
      whileHover={interactive ? {
        scale: 1.02,
        transition: { duration: 0.3, ease: 'easeOut' },
      } : {}}
    >
      {children}

      {/* Gradient overlay for enhanced depth */}
      {animated && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(${currentAngle + 90}deg, transparent, rgba(255,255,255,0.1), transparent)`,
            backgroundSize: '200% 200%',
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

      {/* Interactive glow effect */}
      {interactive && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-inherit"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

// Preset gradient components for easy usage
export const SunsetGradient: React.FC<Omit<LiquidGradientsProps, 'colors' | 'stops' | 'angle' | 'animationType'>> = (props) => (
  <LiquidGradients {...props} colors={['#ff9a9e', '#fecfef', '#fecfef']} stops={[0, 50, 100]} angle={45} />
);

export const OceanGradient: React.FC<Omit<LiquidGradientsProps, 'colors' | 'stops' | 'angle' | 'animationType'>> = (props) => (
  <LiquidGradients {...props} colors={['#667eea', '#764ba2', '#f093fb']} stops={[0, 50, 100]} angle={135} />
);

export const AuroraGradient: React.FC<Omit<LiquidGradientsProps, 'colors' | 'stops' | 'angle' | 'animationType'>> = (props) => (
  <LiquidGradients {...props} colors={['#00d2ff', '#3a7bd5', '#a8edea', '#fed6e3']} stops={[0, 33, 66, 100]} angle={90} />
);

export const FireGradient: React.FC<Omit<LiquidGradientsProps, 'colors' | 'stops' | 'angle' | 'animationType'>> = (props) => (
  <LiquidGradients {...props} colors={['#ff416c', '#ff4b2b', '#ff8a00']} stops={[0, 50, 100]} angle={45} />
);

export const ForestGradient: React.FC<Omit<LiquidGradientsProps, 'colors' | 'stops' | 'angle' | 'animationType'>> = (props) => (
  <LiquidGradients {...props} colors={['#134e5e', '#71b280', '#a8e6cf']} stops={[0, 50, 100]} angle={135} />
);

export default LiquidGradients;