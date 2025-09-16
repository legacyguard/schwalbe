// Enhanced Firefly Animation - Advanced Sofia firefly with personality-aware animations
// Builds upon existing firefly system with better integration and new behaviors

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { Heart, Sparkles, Target } from 'lucide-react';
import { AnimationSystem } from '../../lib/animation-system';
import type {
  EnhancedFireflyProps,
  FireflyPosition,
  TrailPoint,
  PersonalityMode,
} from '@schwalbe/shared/types/animations';

export const EnhancedFirefly: React.FC<EnhancedFireflyProps> = ({
  isVisible = true,
  onInteraction,
  celebrateEvent,
  customMessage,
  size = 'medium',
  followMouse = false,
}) => {
  // For now, we'll use a default personality mode since we don't have the personality manager yet
  const personalityMode: PersonalityMode = 'adaptive';
  const adaptedMode = personalityMode;

  // State management
  const [position, setPosition] = useState<FireflyPosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isIdle, setIsIdle] = useState(true);
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([]);
  const [mousePosition, setMousePosition] = useState<FireflyPosition>({
    x: 0,
    y: 0,
  });
  const [showTooltip, setShowTooltip] = useState(false);

  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTimeoutRef = useRef<number | undefined>(undefined);
  const trailCleanupRef = useRef<number | undefined>(undefined);

  // Check for reduced motion
  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();

  // Size configurations
  const sizeConfig = {
    small: { width: 12, height: 12, glow: 8 },
    medium: { width: 16, height: 16, glow: 12 },
    large: { width: 20, height: 20, glow: 16 },
  };

  const currentSize = sizeConfig[size];

  // Mouse tracking for follow mode
  useEffect(() => {
    if (!followMouse) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [followMouse]);

  // Initialize position
  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          x: rect.width - 80,
          y: 60,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  // Trail management
  const updateTrail = useCallback(
    (newPosition: FireflyPosition) => {
      if (adaptedMode !== 'empathetic' || shouldReduceMotion) return;

      const trailPoint: TrailPoint = {
        ...newPosition,
        id: `trail-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };

      setTrailPoints(prev => {
        const filtered = prev.filter(p => Date.now() - p.timestamp < 2000);
        return [trailPoint, ...filtered].slice(0, 12);
      });

      // Cleanup old trail points
      if (trailCleanupRef.current) {
        clearTimeout(trailCleanupRef.current);
      }

      trailCleanupRef.current = window.setTimeout(() => {
        setTrailPoints(prev =>
          prev.filter(p => Date.now() - p.timestamp < 2000)
        );
      }, 2000);
    },
    [adaptedMode, shouldReduceMotion]
  );

  // Advanced idle animations
  const startIdleAnimation = useCallback(() => {
    if (!isVisible || shouldReduceMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    if (adaptedMode === 'pragmatic') {
      // Efficient, minimal movement
      const baseX = rect.width - 80;
      const baseY = 60;

      controls.start({
        x: [baseX - 5, baseX + 5, baseX],
        y: [baseY - 3, baseY + 3, baseY],
        rotate: [0, 2, -2, 0],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        },
      });
    } else if (adaptedMode === 'empathetic') {
      // Organic, flowing movement
      const generateWanderingPath = () => {
        const points = [];
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 100 + Math.sin(i * 0.5) * 50;
          points.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius * 0.6,
          });
        }
        return points;
      };

      const path = generateWanderingPath();
      const pathX = path.map(p => Math.max(20, Math.min(rect.width - 20, p.x)));
      const pathY = path.map(p =>
        Math.max(20, Math.min(rect.height - 20, p.y))
      );

      controls.start({
        x: pathX,
        y: pathY,
        rotate: [0, 360],
        transition: {
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          onUpdate: (latest: Record<string, unknown>) => {
            if (typeof latest['x'] === 'number' && typeof latest['y'] === 'number') {
              updateTrail({ x: latest['x'], y: latest['y'] });
            }
          },
        },
      } as any);
    } else {
      // Balanced movement
      const figure8Path = [];
      for (let i = 0; i < 16; i++) {
        const t = (i / 16) * Math.PI * 2;
        figure8Path.push({
          x: rect.width / 2 + Math.sin(t) * 60,
          y: rect.height / 2 + Math.sin(t * 2) * 40,
        });
      }

      controls.start({
        x: figure8Path.map(p => p.x),
        y: figure8Path.map(p => p.y),
        transition: {
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        },
      } as any);
    }
  }, [adaptedMode, controls, isVisible, shouldReduceMotion, updateTrail]);

  // Follow mouse behavior
  useEffect(() => {
    if (!followMouse || shouldReduceMotion) return;

    const targetX = mousePosition.x - currentSize.width / 2;
    const targetY = mousePosition.y - currentSize.height / 2;

    controls.start({
      x: targetX,
      y: targetY,
      transition: {
        type: 'spring',
        stiffness: adaptedMode === 'pragmatic' ? 300 : 150,
        damping: adaptedMode === 'pragmatic' ? 30 : 20,
        mass: 0.8,
      },
    });
  }, [
    mousePosition,
    followMouse,
    controls,
    adaptedMode,
    currentSize,
    shouldReduceMotion,
  ]);

  // Enhanced celebration animations
  const celebrate = useCallback(async () => {
    if (!isVisible || !celebrateEvent || shouldReduceMotion) return;

    setIsIdle(false);
    const animConfig = AnimationSystem.getConfig(adaptedMode);

    if (adaptedMode === 'pragmatic') {
      // Efficient celebration
      await controls.start({
        scale: [1, 1.3, 1.1, 1],
        rotate: [0, 180, 360],
        filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
        transition: {
          duration: animConfig.duration * 2,
          ease: "easeInOut",
        },
      } as any);
    } else if (adaptedMode === 'empathetic') {
      // Joyful spiral celebration
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Create heart-shaped celebration path
      const heartPath = [];
      for (let i = 0; i < 20; i++) {
        const t = (i / 20) * Math.PI * 2;
        const x = 16 * Math.sin(t) ** 3;
        const y = -(
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)
        );
        heartPath.push({
          x: centerX + x * 3,
          y: centerY + y * 3,
        });
      }

      await controls.start({
        x: heartPath.map(p => p.x),
        y: heartPath.map(p => p.y),
        scale: [1, 1.4, 1.2, 1],
        rotate: [0, 720],
        filter: ['brightness(1)', 'brightness(1.8)', 'brightness(1)'],
        transition: {
          duration: animConfig.duration * 4,
          ease: "easeInOut",
          onUpdate: (latest: Record<string, unknown>) => {
            if (typeof latest['x'] === 'number' && typeof latest['y'] === 'number') {
              updateTrail({ x: latest['x'], y: latest['y'] });
            }
          },
        },
      } as any);
    }

    setTimeout(() => {
      setIsIdle(true);
      startIdleAnimation();
    }, 1000);
  }, [
    celebrateEvent,
    adaptedMode,
    controls,
    isVisible,
    shouldReduceMotion,
    updateTrail,
    startIdleAnimation,
  ]);

  // Start animations
  useEffect(() => {
    if (celebrateEvent && isVisible) {
      celebrate();
    }
  }, [celebrateEvent, celebrate, isVisible]);

  useEffect(() => {
    if (isVisible && isIdle && !followMouse) {
      const timeout = setTimeout(startIdleAnimation, 200);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isVisible, isIdle, followMouse, startIdleAnimation]);

  // Cleanup
  useEffect(() => {
    return () => {
      const idleTimeout = idleTimeoutRef.current;
      const trailCleanup = trailCleanupRef.current;
      if (idleTimeout) clearTimeout(idleTimeout);
      if (trailCleanup) clearTimeout(trailCleanup);
    };
  }, []);

  if (!isVisible) return null;

  // Get personality-specific colors
  const getPersonalityColors = () => {
    switch (adaptedMode) {
      case 'empathetic':
        return {
          primary: 'from-emerald-200 to-emerald-400',
          glow: 'rgba(16, 185, 129, 0.6)',
          trail: 'bg-emerald-300/40',
        };
      case 'pragmatic':
        return {
          primary: 'from-blue-200 to-blue-400',
          glow: 'rgba(37, 99, 235, 0.6)',
          trail: 'bg-blue-300/40',
        };
      default:
        return {
          primary: 'from-purple-200 to-purple-400',
          glow: 'rgba(147, 51, 234, 0.6)',
          trail: 'bg-purple-300/40',
        };
    }
  };

  const colors = getPersonalityColors();

  return (
    <div
      ref={containerRef}
      className='fixed inset-0 pointer-events-none z-50'
      style={{ position: 'fixed' }}
    >
      {/* Enhanced trail points */}
      <AnimatePresence>
        {adaptedMode === 'empathetic' &&
          !shouldReduceMotion &&
          trailPoints.map(point => (
            <motion.div
              key={point.id}
              className={`absolute w-2 h-2 ${colors.trail} rounded-full`}
              style={{
                left: point.x - 4,
                top: point.y - 4,
              }}
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 0.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
            >
              <div className='w-full h-full rounded-full blur-sm' />
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Main firefly */}
      <motion.div
        animate={controls}
        className='absolute pointer-events-auto cursor-pointer'
        style={{
          x: position.x,
          y: position.y,
          width: currentSize.width,
          height: currentSize.height,
        }}
        onHoverStart={() => {
          setIsHovering(true);
          setShowTooltip(true);
        }}
        onHoverEnd={() => {
          setIsHovering(false);
          setShowTooltip(false);
        }}
        onClick={() => onInteraction?.()}
        onTap={() => onInteraction?.()}
      >
        {/* Enhanced glow effect */}
        <motion.div
          className='absolute inset-0 rounded-full pointer-events-none'
          animate={
            shouldReduceMotion
              ? {}
              : {
                  boxShadow: [
                    `0 0 ${currentSize.glow}px ${colors.glow}`,
                    `0 0 ${currentSize.glow * 1.5}px ${colors.glow}`,
                    `0 0 ${currentSize.glow}px ${colors.glow}`,
                  ],
                }
          }
          transition={{
            duration: adaptedMode === 'pragmatic' ? 2 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Firefly body with personality icon */}
        <motion.div
          className={`w-full h-full bg-gradient-to-br ${colors.primary} rounded-full shadow-lg flex items-center justify-center`}
          animate={
            shouldReduceMotion
              ? { scale: isHovering ? 1.2 : 1 }
              : {
                  scale: isHovering ? 1.2 : 1,
                  filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
                }
          }
          transition={{
            scale: { duration: 0.2 },
            filter: {
              duration: adaptedMode === 'pragmatic' ? 2.5 : 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          {adaptedMode === 'empathetic' && (
            <Heart className='w-2 h-2 text-white/70' />
          )}
          {adaptedMode === 'pragmatic' && (
            <Target className='w-2 h-2 text-white/70' />
          )}
          {adaptedMode === 'adaptive' && (
            <Sparkles className='w-2 h-2 text-white/70' />
          )}
        </motion.div>

        {/* Interactive tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              className='absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap backdrop-blur-sm'
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {customMessage ||
                (adaptedMode === 'empathetic'
                  ? '✨ Sofia - Your caring guide'
                  : adaptedMode === 'pragmatic'
                    ? '🎯 Sofia - Your efficient assistant'
                    : '🌟 Sofia - Your adaptive companion')}
              <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90' />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EnhancedFirefly;