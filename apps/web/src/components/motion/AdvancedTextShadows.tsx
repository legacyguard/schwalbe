import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

import { cn } from '@/lib/utils';

export type ShadowLayer = {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  opacity?: number;
  spread?: number;
};

export type ShadowPreset =
  | 'subtle'
  | 'moderate'
  | 'dramatic'
  | 'neon'
  | 'vintage'
  | 'floating'
  | 'embossed'
  | 'glow'
  | 'depth'
  | 'rainbow';

export type AnimationType = 'pulse' | 'wave' | 'float' | 'breathe' | 'rotate' | 'scale';

interface AdvancedTextShadowsProps {
  children: React.ReactNode;
  shadows?: ShadowLayer[] | ShadowPreset;
  animation?: AnimationType;
  intensity?: 'subtle' | 'moderate' | 'intense';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  trigger?: 'hover' | 'inView' | 'load' | 'custom';
  autoPlay?: boolean;
  loop?: boolean;
  duration?: number;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
}

const shadowPresets: Record<ShadowPreset, ShadowLayer[]> = {
  subtle: [
    {
      offsetX: 1,
      offsetY: 1,
      blur: 2,
      color: '#000000',
      opacity: 0.1
    }
  ],
  moderate: [
    {
      offsetX: 2,
      offsetY: 2,
      blur: 4,
      color: '#000000',
      opacity: 0.15
    },
    {
      offsetX: 1,
      offsetY: 1,
      blur: 1,
      color: '#000000',
      opacity: 0.1
    }
  ],
  dramatic: [
    {
      offsetX: 4,
      offsetY: 4,
      blur: 8,
      color: '#000000',
      opacity: 0.2
    },
    {
      offsetX: 2,
      offsetY: 2,
      blur: 4,
      color: '#000000',
      opacity: 0.15
    },
    {
      offsetX: 1,
      offsetY: 1,
      blur: 1,
      color: '#000000',
      opacity: 0.1
    }
  ],
  neon: [
    {
      offsetX: 0,
      offsetY: 0,
      blur: 10,
      color: '#00ffff',
      opacity: 0.8
    },
    {
      offsetX: 0,
      offsetY: 0,
      blur: 20,
      color: '#0080ff',
      opacity: 0.6
    },
    {
      offsetX: 0,
      offsetY: 0,
      blur: 30,
      color: '#ff00ff',
      opacity: 0.4
    }
  ],
  vintage: [
    {
      offsetX: 3,
      offsetY: 3,
      blur: 0,
      color: '#8b4513',
      opacity: 0.3
    },
    {
      offsetX: 1,
      offsetY: 1,
      blur: 1,
      color: '#daa520',
      opacity: 0.2
    }
  ],
  floating: [
    {
      offsetX: 0,
      offsetY: 5,
      blur: 10,
      color: '#000000',
      opacity: 0.2
    },
    {
      offsetX: 0,
      offsetY: 2,
      blur: 5,
      color: '#000000',
      opacity: 0.15
    }
  ],
  embossed: [
    {
      offsetX: 1,
      offsetY: 1,
      blur: 0,
      color: '#ffffff',
      opacity: 0.8
    },
    {
      offsetX: -1,
      offsetY: -1,
      blur: 0,
      color: '#000000',
      opacity: 0.3
    }
  ],
  glow: [
    {
      offsetX: 0,
      offsetY: 0,
      blur: 5,
      color: '#ffff00',
      opacity: 0.6
    },
    {
      offsetX: 0,
      offsetY: 0,
      blur: 10,
      color: '#ff6600',
      opacity: 0.4
    },
    {
      offsetX: 0,
      offsetY: 0,
      blur: 15,
      color: '#ff0000',
      opacity: 0.2
    }
  ],
  depth: [
    {
      offsetX: 0,
      offsetY: 1,
      blur: 3,
      color: '#000000',
      opacity: 0.3
    },
    {
      offsetX: 0,
      offsetY: 3,
      blur: 6,
      color: '#000000',
      opacity: 0.2
    },
    {
      offsetX: 0,
      offsetY: 6,
      blur: 12,
      color: '#000000',
      opacity: 0.1
    }
  ],
  rainbow: [
    {
      offsetX: 0,
      offsetY: 0,
      blur: 5,
      color: '#ff0000',
      opacity: 0.3
    },
    {
      offsetX: 0,
      offsetY: 0,
      blur: 10,
      color: '#ff8000',
      opacity: 0.3
    },
    {
      offsetX: 0,
      offsetY: 0,
      blur: 15,
      color: '#ffff00',
      opacity: 0.3
    },
    {
      offsetX: 0,
      offsetY: 0,
      blur: 20,
      color: '#00ff00',
      opacity: 0.2
    },
    {
      offsetX: 0,
      offsetY: 0,
      blur: 25,
      color: '#0080ff',
      opacity: 0.2
    },
    {
      offsetX: 0,
      offsetY: 0,
      blur: 30,
      color: '#8000ff',
      opacity: 0.2
    }
  ]
};

export const AdvancedTextShadows: React.FC<AdvancedTextShadowsProps> = ({
  children,
  shadows = 'moderate',
  animation = 'breathe',
  intensity = 'moderate',
  className,
  as: Component = 'span',
  trigger = 'inView',
  autoPlay = false,
  loop = false,
  duration = 2,
  onAnimationStart,
  onAnimationComplete,
}) => {
  const [isVisible, setIsVisible] = useState(autoPlay);
  const [isAnimating, setIsAnimating] = useState(false);
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const shadowLayers = Array.isArray(shadows) ? shadows : shadowPresets[shadows];

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
      case 'pulse':
        return {
          scale: [1, 1.05, 1],
          transition: {
            duration: duration * intensityMultiplier,
            ease: "easeInOut",
            repeat: loop ? Infinity : 0,
            repeatType: loop ? "reverse" as const : undefined
          }
        };

      case 'wave':
        return {
          rotate: [-1, 1, -1],
          transition: {
            duration: duration * intensityMultiplier,
            ease: "easeInOut",
            repeat: loop ? Infinity : 0,
            repeatType: loop ? "reverse" as const : undefined
          }
        };

      case 'float':
        return {
          y: [-2, 2, -2],
          transition: {
            duration: duration * intensityMultiplier,
            ease: "easeInOut",
            repeat: loop ? Infinity : 0,
            repeatType: loop ? "reverse" as const : undefined
          }
        };

      case 'breathe':
        return {
          scale: [1, 1.02, 1],
          opacity: [0.9, 1, 0.9],
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

      case 'scale':
        return {
          scale: [0.95, 1.05, 0.95],
          transition: {
            duration: duration * intensityMultiplier,
            ease: "easeInOut",
            repeat: loop ? Infinity : 0,
            repeatType: loop ? "reverse" as const : undefined
          }
        };

      default:
        return {
          scale: [1, 1.02, 1],
          transition: {
            duration: duration * intensityMultiplier,
            ease: "easeInOut"
          }
        };
    }
  };

  const generateShadowCSS = (layers: ShadowLayer[]) => {
    return layers
      .map(layer => {
        const spread = layer.spread ? ` ${layer.spread}px` : '';
        return `${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px${spread} ${layer.color}${layer.opacity ? `${Math.round(layer.opacity * 255).toString(16).padStart(2, '0')}` : ''}`;
      })
      .join(', ');
  };

  const renderContent = () => {
    return (
      <motion.div
        ref={ref}
        className={className}
        animate={controls}
        style={{
          textShadow: generateShadowCSS(shadowLayers),
          filter: shadowLayers.some(layer => layer.blur > 10) ? 'contrast(1.1)' : undefined
        }}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <Component className={cn('advanced-text-shadows', className)}>
      <div style={{ position: 'relative' }}>
        {renderContent()}

        {/* Additional glow effect for certain presets */}
        {(shadows === 'neon' || shadows === 'glow' || shadows === 'rainbow') && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${shadowLayers[0]?.color}20 0%, transparent 70%)`,
              mixBlendMode: 'multiply',
              opacity: 0.3
            }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
    </Component>
  );
};

// Specialized shadow components
export const SubtleShadowText: React.FC<Omit<AdvancedTextShadowsProps, 'shadows'>> = (props) => (
  <AdvancedTextShadows {...props} shadows="subtle" />
);

export const DramaticShadowText: React.FC<Omit<AdvancedTextShadowsProps, 'shadows'>> = (props) => (
  <AdvancedTextShadows {...props} shadows="dramatic" />
);

export const NeonShadowText: React.FC<Omit<AdvancedTextShadowsProps, 'shadows'>> = (props) => (
  <AdvancedTextShadows {...props} shadows="neon" />
);

export const VintageShadowText: React.FC<Omit<AdvancedTextShadowsProps, 'shadows'>> = (props) => (
  <AdvancedTextShadows {...props} shadows="vintage" />
);

export const FloatingShadowText: React.FC<Omit<AdvancedTextShadowsProps, 'shadows'>> = (props) => (
  <AdvancedTextShadows {...props} shadows="floating" />
);

export const EmbossedShadowText: React.FC<Omit<AdvancedTextShadowsProps, 'shadows'>> = (props) => (
  <AdvancedTextShadows {...props} shadows="embossed" />
);

export const GlowShadowText: React.FC<Omit<AdvancedTextShadowsProps, 'shadows'>> = (props) => (
  <AdvancedTextShadows {...props} shadows="glow" />
);

export const DepthShadowText: React.FC<Omit<AdvancedTextShadowsProps, 'shadows'>> = (props) => (
  <AdvancedTextShadows {...props} shadows="depth" />
);

export const RainbowShadowText: React.FC<Omit<AdvancedTextShadowsProps, 'shadows'>> = (props) => (
  <AdvancedTextShadows {...props} shadows="rainbow" />
);

// Animation variants for the hook
const getAnimationVariantsForHook = (
  animation: AnimationType,
  duration: number = 2,
  intensity: 'subtle' | 'moderate' | 'intense' = 'moderate',
  loop: boolean = false
) => {
  const intensityMultiplier = intensity === 'subtle' ? 0.7 : intensity === 'intense' ? 1.3 : 1;

  switch (animation) {
    case 'pulse':
      return {
        scale: [1, 1.05, 1],
        transition: {
          duration: duration * intensityMultiplier,
          ease: "easeInOut",
          repeat: loop ? Infinity : 0,
          repeatType: loop ? "reverse" as const : undefined
        }
      };

    case 'wave':
      return {
        rotate: [-1, 1, -1],
        transition: {
          duration: duration * intensityMultiplier,
          ease: "easeInOut",
          repeat: loop ? Infinity : 0,
          repeatType: loop ? "reverse" as const : undefined
        }
      };

    case 'float':
      return {
        y: [-2, 2, -2],
        transition: {
          duration: duration * intensityMultiplier,
          ease: "easeInOut",
          repeat: loop ? Infinity : 0,
          repeatType: loop ? "reverse" as const : undefined
        }
      };

    case 'breathe':
      return {
        scale: [1, 1.02, 1],
        opacity: [0.9, 1, 0.9],
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

    case 'scale':
      return {
        scale: [0.95, 1.05, 0.95],
        transition: {
          duration: duration * intensityMultiplier,
          ease: "easeInOut",
          repeat: loop ? Infinity : 0,
          repeatType: loop ? "reverse" as const : undefined
        }
      };

    default:
      return {
        scale: [1, 1.02, 1],
        transition: {
          duration: duration * intensityMultiplier,
          ease: "easeInOut"
        }
      };
  }
};

// Hook for custom shadow animations
export const useAdvancedShadows = () => {
  const controls = useAnimation();
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = async (animation: AnimationType, options?: {
    duration?: number;
    intensity?: 'subtle' | 'moderate' | 'intense';
    loop?: boolean;
  }) => {
    setIsAnimating(true);

    const intensityMultiplier = options?.intensity === 'subtle' ? 0.7 :
                              options?.intensity === 'intense' ? 1.3 : 1;

    await controls.start(getAnimationVariantsForHook(
      animation,
      options?.duration || 2,
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