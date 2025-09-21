import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface MagneticHoverProps {
  children: React.ReactNode;
  strength?: number;
  range?: number;
  springConfig?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
  scale?: number;
  rotation?: number;
  enableRotation?: boolean;
  enableScale?: boolean;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onMagneticStart?: () => void;
  onMagneticEnd?: () => void;
  onPositionChange?: (x: number, y: number) => void;
}

interface MagneticVariant {
  name: string;
  strength: number;
  range: number;
  springConfig: {
    stiffness: number;
    damping: number;
    mass: number;
  };
  scale: number;
  rotation: number;
  enableRotation: boolean;
  enableScale: boolean;
}

const MagneticHover: React.FC<MagneticHoverProps> = ({
  children,
  strength = 0.3,
  range = 100,
  springConfig = {
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  scale = 1.1,
  rotation = 5,
  enableRotation = true,
  enableScale = true,
  className = '',
  style = {},
  disabled = false,
  onMagneticStart,
  onMagneticEnd,
  onPositionChange,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Motion values for magnetic effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);

  // Spring physics for smooth magnetic attraction
  const springX = useSpring(targetX, {
    stiffness: springConfig.stiffness,
    damping: springConfig.damping,
    mass: springConfig.mass,
  });

  const springY = useSpring(targetY, {
    stiffness: springConfig.stiffness,
    damping: springConfig.damping,
    mass: springConfig.mass,
  });

  // Transform spring values to element position
  const translateX = useTransform(springX, [-0.5, 0.5], [-range * strength, range * strength]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-range * strength, range * strength]);

  // Scale and rotation transforms
  const scaleTransform = useTransform(
    useMotionValue(isHovered && enableScale ? scale : 1),
    [1, scale],
    [1, scale]
  );

  const rotationTransform = useTransform(
    useMotionValue(isHovered && enableRotation ? rotation : 0),
    [0, rotation],
    [0, rotation]
  );

  // Magnetic variant configurations
  const magneticVariants: Record<string, MagneticVariant> = {
    subtle: {
      name: 'Subtle Attraction',
      strength: 0.15,
      range: 60,
      springConfig: { stiffness: 200, damping: 25, mass: 0.8 },
      scale: 1.05,
      rotation: 2,
      enableRotation: true,
      enableScale: true,
    },
    gentle: {
      name: 'Gentle Pull',
      strength: 0.25,
      range: 80,
      springConfig: { stiffness: 250, damping: 28, mass: 0.9 },
      scale: 1.08,
      rotation: 3,
      enableRotation: true,
      enableScale: true,
    },
    moderate: {
      name: 'Moderate Magnetism',
      strength: 0.35,
      range: 100,
      springConfig: { stiffness: 300, damping: 30, mass: 1 },
      scale: 1.12,
      rotation: 5,
      enableRotation: true,
      enableScale: true,
    },
    strong: {
      name: 'Strong Attraction',
      strength: 0.5,
      range: 120,
      springConfig: { stiffness: 400, damping: 35, mass: 1.2 },
      scale: 1.15,
      rotation: 8,
      enableRotation: true,
      enableScale: true,
    },
    intense: {
      name: 'Intense Magnetism',
      strength: 0.7,
      range: 150,
      springConfig: { stiffness: 500, damping: 40, mass: 1.5 },
      scale: 1.2,
      rotation: 12,
      enableRotation: true,
      enableScale: true,
    },
    playful: {
      name: 'Playful Bounce',
      strength: 0.4,
      range: 90,
      springConfig: { stiffness: 350, damping: 20, mass: 0.7 },
      scale: 1.18,
      rotation: 6,
      enableRotation: true,
      enableScale: true,
    },
    elegant: {
      name: 'Elegant Drift',
      strength: 0.2,
      range: 70,
      springConfig: { stiffness: 180, damping: 35, mass: 1.1 },
      scale: 1.06,
      rotation: 1,
      enableRotation: false,
      enableScale: true,
    },
    dramatic: {
      name: 'Dramatic Pull',
      strength: 0.8,
      range: 180,
      springConfig: { stiffness: 600, damping: 45, mass: 2 },
      scale: 1.25,
      rotation: 15,
      enableRotation: true,
      enableScale: true,
    },
  };

  // Mouse move handler for magnetic effect
  const handleMouseMove = (event: React.MouseEvent) => {
    if (disabled || shouldReduceMotion || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (event.clientX - centerX) / (rect.width / 2);
    const deltaY = (event.clientY - centerY) / (rect.height / 2);

    // Clamp values to prevent excessive movement
    const clampedX = Math.max(-0.5, Math.min(0.5, deltaX));
    const clampedY = Math.max(-0.5, Math.min(0.5, deltaY));

    targetX.set(clampedX);
    targetY.set(clampedY);

    onPositionChange?.(event.clientX, event.clientY);
  };

  // Mouse enter handler
  const handleMouseEnter = () => {
    if (disabled || shouldReduceMotion) return;

    setIsHovered(true);
    setIsActive(true);
    onMagneticStart?.();
  };

  // Mouse leave handler
  const handleMouseLeave = () => {
    if (disabled || shouldReduceMotion) return;

    setIsHovered(false);
    setIsActive(false);

    // Reset to center position
    targetX.set(0);
    targetY.set(0);

    onMagneticEnd?.();
  };

  // Touch event handlers for mobile support
  const handleTouchStart = (event: React.TouchEvent) => {
    if (disabled || shouldReduceMotion || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const touch = event.touches[0];
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (touch?.clientX || 0 - centerX) / (rect.width / 2);
    const deltaY = (touch?.clientY || 0 - centerY) / (rect.height / 2);

    const clampedX = Math.max(-0.5, Math.min(0.5, deltaX));
    const clampedY = Math.max(-0.5, Math.min(0.5, deltaY));

    targetX.set(clampedX);
    targetY.set(clampedY);

    setIsActive(true);
    onMagneticStart?.();
  };

  const handleTouchEnd = () => {
    if (disabled || shouldReduceMotion) return;

    setIsActive(false);
    targetX.set(0);
    targetY.set(0);
    onMagneticEnd?.();
  };

  // Dynamic styles
  const dynamicStyles: React.CSSProperties = {
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    transition: shouldReduceMotion ? 'none' : 'transform 0.2s ease-out',
    ...style,
  };

  return (
    <motion.div
      ref={containerRef}
      className={`magnetic-hover ${className} ${isActive ? 'magnetic-active' : ''}`}
      style={dynamicStyles}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      whileHover={shouldReduceMotion ? {} : {
        scale: enableScale ? scale : 1,
        rotate: enableRotation ? rotation : 0,
        transition: {
          type: 'spring',
          stiffness: springConfig.stiffness,
          damping: springConfig.damping,
        },
      }}
    >
      <motion.div
        style={{
          x: shouldReduceMotion ? 0 : translateX,
          y: shouldReduceMotion ? 0 : translateY,
          scale: shouldReduceMotion ? 1 : scaleTransform,
          rotate: shouldReduceMotion ? 0 : rotationTransform,
          transformOrigin: 'center center',
        }}
        transition={{
          type: 'spring',
          stiffness: springConfig.stiffness,
          damping: springConfig.damping,
          mass: springConfig.mass,
        }}
      >
        {children}

        {/* Magnetic field visualization (dev mode) */}
        {process.env.NODE_ENV === 'development' && isActive && !shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, rgba(147, 51, 234, 0.1) 0%, transparent 70%)`,
              border: '2px solid rgba(147, 51, 234, 0.3)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Attraction lines effect */}
        {isActive && !shouldReduceMotion && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  width: '1px',
                  height: `${range}px`,
                  background: `linear-gradient(to bottom, rgba(147, 51, 234, 0.3), transparent)`,
                  left: '50%',
                  top: '50%',
                  transformOrigin: 'center top',
                }}
                animate={{
                  rotate: i * 45,
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </>
        )}

        {/* Ripple effect on activation */}
        {isActive && !shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              border: '2px solid rgba(147, 51, 234, 0.4)',
            }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              opacity: 0,
              scale: 1.5,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
          />
        )}

        {/* Particle trail effect */}
        {isActive && !shouldReduceMotion && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 rounded-full pointer-events-none"
                style={{
                  backgroundColor: 'rgba(147, 51, 234, 0.6)',
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 60],
                  y: [0, (Math.random() - 0.5) * 60],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.05,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}

        {/* Accessibility indicator */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute -top-6 left-0 text-xs bg-purple-500 text-white px-2 py-1 rounded">
            Magnetic • {strength.toFixed(2)} • {range}px
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Preset magnetic hover components for easy usage
export const SubtleMagnetic: React.FC<Omit<MagneticHoverProps, 'strength' | 'range' | 'springConfig' | 'scale' | 'rotation'>> = (props) => (
  <MagneticHover {...props} strength={0.15} range={60} scale={1.05} rotation={2} />
);

export const GentleMagnetic: React.FC<Omit<MagneticHoverProps, 'strength' | 'range' | 'springConfig' | 'scale' | 'rotation'>> = (props) => (
  <MagneticHover {...props} strength={0.25} range={80} scale={1.08} rotation={3} />
);

export const ModerateMagnetic: React.FC<Omit<MagneticHoverProps, 'strength' | 'range' | 'springConfig' | 'scale' | 'rotation'>> = (props) => (
  <MagneticHover {...props} strength={0.35} range={100} scale={1.12} rotation={5} />
);

export const StrongMagnetic: React.FC<Omit<MagneticHoverProps, 'strength' | 'range' | 'springConfig' | 'scale' | 'rotation'>> = (props) => (
  <MagneticHover {...props} strength={0.5} range={120} scale={1.15} rotation={8} />
);

export const IntenseMagnetic: React.FC<Omit<MagneticHoverProps, 'strength' | 'range' | 'springConfig' | 'scale' | 'rotation'>> = (props) => (
  <MagneticHover {...props} strength={0.7} range={150} scale={1.2} rotation={12} />
);

export const PlayfulMagnetic: React.FC<Omit<MagneticHoverProps, 'strength' | 'range' | 'springConfig' | 'scale' | 'rotation'>> = (props) => (
  <MagneticHover {...props} strength={0.4} range={90} scale={1.18} rotation={6} />
);

export const ElegantMagnetic: React.FC<Omit<MagneticHoverProps, 'strength' | 'range' | 'springConfig' | 'scale' | 'rotation' | 'enableRotation'>> = (props) => (
  <MagneticHover {...props} strength={0.2} range={70} scale={1.06} rotation={1} enableRotation={false} />
);

export const DramaticMagnetic: React.FC<Omit<MagneticHoverProps, 'strength' | 'range' | 'springConfig' | 'scale' | 'rotation'>> = (props) => (
  <MagneticHover {...props} strength={0.8} range={180} scale={1.25} rotation={15} />
);

export default MagneticHover;