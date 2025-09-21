import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

import { cn } from '@/lib/utils';

export type GradientDirection =
  | 'to-right'
  | 'to-left'
  | 'to-top'
  | 'to-bottom'
  | 'to-top-right'
  | 'to-top-left'
  | 'to-bottom-right'
  | 'to-bottom-left'
  | 'radial'
  | 'conic';

export type GradientPreset =
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'lavender'
  | 'fire'
  | 'aurora'
  | 'neon'
  | 'pastel'
  | 'metallic'
  | 'rainbow';

export type AnimationEffect = 'shimmer' | 'wave' | 'pulse' | 'rotate' | 'morph' | 'liquid';

interface GradientStop {
  offset: number;
  color: string;
  opacity?: number;
}

interface GradientTextProps {
  children: React.ReactNode;
  gradient?: GradientPreset | GradientStop[];
  direction?: GradientDirection;
  animation?: AnimationEffect;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  intensity?: 'subtle' | 'moderate' | 'intense';
  trigger?: 'hover' | 'inView' | 'load' | 'custom';
  autoPlay?: boolean;
  loop?: boolean;
  duration?: number;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}

const gradientPresets: Record<GradientPreset, GradientStop[]> = {
  sunset: [
    { offset: 0, color: '#ff6b6b' },
    { offset: 25, color: '#ffa726' },
    { offset: 50, color: '#ffeb3b' },
    { offset: 75, color: '#66bb6a' },
    { offset: 100, color: '#42a5f5' }
  ],
  ocean: [
    { offset: 0, color: '#e3f2fd' },
    { offset: 25, color: '#90caf9' },
    { offset: 50, color: '#42a5f5' },
    { offset: 75, color: '#1e88e5' },
    { offset: 100, color: '#0d47a1' }
  ],
  forest: [
    { offset: 0, color: '#e8f5e8' },
    { offset: 25, color: '#a5d6a7' },
    { offset: 50, color: '#66bb6a' },
    { offset: 75, color: '#388e3c' },
    { offset: 100, color: '#1b5e20' }
  ],
  lavender: [
    { offset: 0, color: '#f3e5f5' },
    { offset: 25, color: '#ce93d8' },
    { offset: 50, color: '#9c27b0' },
    { offset: 75, color: '#6a1b9a' },
    { offset: 100, color: '#4a148c' }
  ],
  fire: [
    { offset: 0, color: '#ffebee' },
    { offset: 25, color: '#ff7043' },
    { offset: 50, color: '#ff5722' },
    { offset: 75, color: '#d84315' },
    { offset: 100, color: '#bf360c' }
  ],
  aurora: [
    { offset: 0, color: '#f3e5f5' },
    { offset: 20, color: '#e1bee7' },
    { offset: 40, color: '#ce93d8' },
    { offset: 60, color: '#ba68c8' },
    { offset: 80, color: '#9c27b0' },
    { offset: 100, color: '#7b1fa2' }
  ],
  neon: [
    { offset: 0, color: '#00ffff' },
    { offset: 33, color: '#00ff80' },
    { offset: 66, color: '#ff8000' },
    { offset: 100, color: '#ff0080' }
  ],
  pastel: [
    { offset: 0, color: '#ffb3ba' },
    { offset: 25, color: '#bae1ff' },
    { offset: 50, color: '#baffc9' },
    { offset: 75, color: '#ffffba' },
    { offset: 100, color: '#ffb3ff' }
  ],
  metallic: [
    { offset: 0, color: '#f8f8ff' },
    { offset: 25, color: '#e6e6fa' },
    { offset: 50, color: '#c0c0c0' },
    { offset: 75, color: '#808080' },
    { offset: 100, color: '#2f2f2f' }
  ],
  rainbow: [
    { offset: 0, color: '#ff0000' },
    { offset: 16.66, color: '#ff8000' },
    { offset: 33.33, color: '#ffff00' },
    { offset: 50, color: '#80ff00' },
    { offset: 66.66, color: '#00ff80' },
    { offset: 83.33, color: '#0080ff' },
    { offset: 100, color: '#8000ff' }
  ]
};

const getGradientCSS = (
  stops: GradientStop[],
  direction: GradientDirection
): string => {
  const stopsString = stops
    .map(stop => `${stop.color}${stop.opacity ? `${Math.round(stop.opacity * 255).toString(16).padStart(2, '0')}` : ''} ${stop.offset}%`)
    .join(', ');

  switch (direction) {
    case 'to-right':
      return `linear-gradient(to right, ${stopsString})`;
    case 'to-left':
      return `linear-gradient(to left, ${stopsString})`;
    case 'to-top':
      return `linear-gradient(to top, ${stopsString})`;
    case 'to-bottom':
      return `linear-gradient(to bottom, ${stopsString})`;
    case 'to-top-right':
      return `linear-gradient(to top right, ${stopsString})`;
    case 'to-top-left':
      return `linear-gradient(to top left, ${stopsString})`;
    case 'to-bottom-right':
      return `linear-gradient(to bottom right, ${stopsString})`;
    case 'to-bottom-left':
      return `linear-gradient(to bottom left, ${stopsString})`;
    case 'radial':
      return `radial-gradient(circle, ${stopsString})`;
    case 'conic':
      return `conic-gradient(from 0deg, ${stopsString})`;
    default:
      return `linear-gradient(to right, ${stopsString})`;
  }
};

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  gradient = 'sunset',
  direction = 'to-right',
  animation = 'shimmer',
  intensity = 'moderate',
  className,
  as: Component = 'span',
  trigger = 'inView',
  autoPlay = false,
  loop = false,
  duration = 3,
  onAnimationStart,
  onAnimationComplete,
}) => {
  const [isVisible, setIsVisible] = useState(autoPlay);
  const [isAnimating, setIsAnimating] = useState(false);
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const gradientStops = Array.isArray(gradient) ? gradient : gradientPresets[gradient];

  // Handle trigger logic
  useEffect(() => {
    if (trigger === 'load') {
      setIsVisible(true);
    } else if (trigger === 'inView' && isInView) {
      setIsVisible(true);
    }
  }, [trigger, isInView]);

  // Start animation when visible
  useEffect(() => {
    if (!isVisible) return;

    const startAnimation = async () => {
      setIsAnimating(true);
      onAnimationStart?.();

      await controls.start(getAnimationVariants());

      setIsAnimating(false);
      onAnimationComplete?.();
    };

    const timer = setTimeout(startAnimation, 100);
    return () => clearTimeout(timer);
  }, [isVisible, controls, onAnimationStart, onAnimationComplete]);

  const getAnimationVariants = () => {
    const intensityMultiplier = intensity === 'subtle' ? 0.7 : intensity === 'intense' ? 1.3 : 1;

    switch (animation) {
      case 'shimmer':
        return {
          backgroundPosition: ['-200% 0%', '200% 0%'],
          transition: {
            duration: duration * intensityMultiplier,
            ease: "easeInOut",
            repeat: loop ? Infinity : 0,
            repeatType: loop ? "reverse" as const : undefined
          }
        };

      case 'wave':
        return {
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          transition: {
            duration: duration * intensityMultiplier,
            ease: "easeInOut",
            repeat: loop ? Infinity : 0,
            repeatType: loop ? "reverse" as const : undefined
          }
        };

      case 'pulse':
        return {
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
          transition: {
            duration: duration * intensityMultiplier,
            ease: "easeInOut",
            repeat: loop ? Infinity : 0,
            repeatType: loop ? "reverse" as const : undefined
          }
        };

      case 'rotate':
        return {
          rotate: [0, 360],
          transition: {
            duration: duration * intensityMultiplier,
            ease: "linear",
            repeat: loop ? Infinity : 0
          }
        };

      case 'morph':
        return {
          borderRadius: ["0%", "50%", "0%"],
          scale: [1, 1.02, 1],
          transition: {
            duration: duration * intensityMultiplier,
            ease: "easeInOut",
            repeat: loop ? Infinity : 0,
            repeatType: loop ? "reverse" as const : undefined
          }
        };

      case 'liquid':
        return {
          filter: [
            'hue-rotate(0deg) brightness(1)',
            'hue-rotate(360deg) brightness(1.1)',
            'hue-rotate(0deg) brightness(1)'
          ],
          transition: {
            duration: duration * intensityMultiplier,
            ease: "easeInOut",
            repeat: loop ? Infinity : 0,
            repeatType: loop ? "reverse" as const : undefined
          }
        };

      default:
        return {
          backgroundPosition: ['-200% 0%', '200% 0%'],
          transition: {
            duration: duration * intensityMultiplier,
            ease: "easeInOut"
          }
        };
    }
  };

  const renderContent = () => {
    const gradientCSS = getGradientCSS(gradientStops, direction);

    return (
      <motion.div
        ref={ref}
        className={cn('gradient-text', className)}
        animate={controls}
        style={{
          background: gradientCSS,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: animation === 'shimmer' || animation === 'wave' ? '200% 100%' : '100% 100%',
          display: 'inline-block'
        }}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <Component className={cn('gradient-text-container', className)}>
      <div style={{ position: 'relative' }}>
        {renderContent()}

        {/* Additional glow effect for certain animations */}
        {(animation === 'shimmer' || animation === 'wave') && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${gradientStops[Math.floor(gradientStops.length / 2)]?.color}40, transparent)`,
              backgroundSize: '200% 100%',
              mixBlendMode: 'overlay',
              opacity: 0.3
            }}
            animate={{
              backgroundPosition: ['-200% 0%', '200% 0%'],
            }}
            transition={{
              duration: duration,
              ease: "easeInOut",
              repeat: loop ? Infinity : 0,
              repeatType: loop ? "reverse" as const : undefined
            }}
          />
        )}
      </div>
    </Component>
  );
};

// Specialized gradient text components
export const SunsetText: React.FC<Omit<GradientTextProps, 'gradient'>> = (props) => (
  <GradientText {...props} gradient="sunset" />
);

export const OceanText: React.FC<Omit<GradientTextProps, 'gradient'>> = (props) => (
  <GradientText {...props} gradient="ocean" />
);

export const NeonText: React.FC<Omit<GradientTextProps, 'gradient'>> = (props) => (
  <GradientText {...props} gradient="neon" />
);

export const RainbowText: React.FC<Omit<GradientTextProps, 'gradient'>> = (props) => (
  <GradientText {...props} gradient="rainbow" />
);

export const MetallicText: React.FC<Omit<GradientTextProps, 'gradient'>> = (props) => (
  <GradientText {...props} gradient="metallic" />
);

export const AuroraText: React.FC<Omit<GradientTextProps, 'gradient'>> = (props) => (
  <GradientText {...props} gradient="aurora" />
);

export const ShimmerText: React.FC<Omit<GradientTextProps, 'animation'>> = (props) => (
  <GradientText {...props} animation="shimmer" />
);

export const WaveText: React.FC<Omit<GradientTextProps, 'animation'>> = (props) => (
  <GradientText {...props} animation="wave" />
);

export const LiquidText: React.FC<Omit<GradientTextProps, 'animation'>> = (props) => (
  <GradientText {...props} animation="liquid" />
);

// Animation variants for the hook
const getAnimationVariantsForHook = (
  animation: AnimationEffect,
  duration: number = 3,
  intensity: 'subtle' | 'moderate' | 'intense' = 'moderate',
  loop: boolean = false
) => {
  const intensityMultiplier = intensity === 'subtle' ? 0.7 : intensity === 'intense' ? 1.3 : 1;

  switch (animation) {
    case 'shimmer':
      return {
        backgroundPosition: ['-200% 0%', '200% 0%'],
        transition: {
          duration: duration * intensityMultiplier,
          ease: "easeInOut",
          repeat: loop ? Infinity : 0,
          repeatType: loop ? "reverse" as const : undefined
        }
      };

    case 'wave':
      return {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: {
          duration: duration * intensityMultiplier,
          ease: "easeInOut",
          repeat: loop ? Infinity : 0,
          repeatType: loop ? "reverse" as const : undefined
        }
      };

    case 'pulse':
      return {
        scale: [1, 1.05, 1],
        opacity: [0.8, 1, 0.8],
        transition: {
          duration: duration * intensityMultiplier,
          ease: "easeInOut",
          repeat: loop ? Infinity : 0,
          repeatType: loop ? "reverse" as const : undefined
        }
      };

    case 'rotate':
      return {
        rotate: [0, 360],
        transition: {
          duration: duration * intensityMultiplier,
          ease: "linear",
          repeat: loop ? Infinity : 0
        }
      };

    case 'morph':
      return {
        borderRadius: ["0%", "50%", "0%"],
        scale: [1, 1.02, 1],
        transition: {
          duration: duration * intensityMultiplier,
          ease: "easeInOut",
          repeat: loop ? Infinity : 0,
          repeatType: loop ? "reverse" as const : undefined
        }
      };

    case 'liquid':
      return {
        filter: [
          'hue-rotate(0deg) brightness(1)',
          'hue-rotate(360deg) brightness(1.1)',
          'hue-rotate(0deg) brightness(1)'
        ],
        transition: {
          duration: duration * intensityMultiplier,
          ease: "easeInOut",
          repeat: loop ? Infinity : 0,
          repeatType: loop ? "reverse" as const : undefined
        }
      };

    default:
      return {
        backgroundPosition: ['-200% 0%', '200% 0%'],
        transition: {
          duration: duration * intensityMultiplier,
          ease: "easeInOut"
        }
      };
  }
};

// Hook for custom gradient animations
export const useGradientText = () => {
  const controls = useAnimation();
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = async (animation: AnimationEffect, options?: {
    duration?: number;
    intensity?: 'subtle' | 'moderate' | 'intense';
    loop?: boolean;
  }) => {
    setIsAnimating(true);

    const intensityMultiplier = options?.intensity === 'subtle' ? 0.7 :
                              options?.intensity === 'intense' ? 1.3 : 1;

    await controls.start(getAnimationVariantsForHook(
      animation,
      options?.duration || 3,
      options?.intensity || 'moderate',
      options?.loop || false
    ));

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