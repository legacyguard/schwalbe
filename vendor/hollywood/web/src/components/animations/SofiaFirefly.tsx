
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
// import type { Timeout } from 'node:timers'; // Not available in browser
import {
  type CommunicationStyle,
  defaultUserPreferences,
  type UserPreferences,
} from '@/types/user-preferences';
import { useFirefly } from '@/contexts/FireflyContext';
import useFireflyEvents from '@/hooks/useFireflyEvents';

interface SofiaFireflyProps {
  celebrateEvent?: 'document_upload' | 'guardian_added' | 'milestone' | null;
  isVisible?: boolean;
  mode?: CommunicationStyle;
  onInteraction?: () => void;
  targetElement?: string; // CSS selector for element to guide to
}

interface FireflyPosition {
  x: number;
  y: number;
}

export const SofiaFirefly: React.FC<SofiaFireflyProps> = ({
  mode,
  isVisible,
  onInteraction,
  targetElement,
  celebrateEvent,
}) => {
  const { userId } = useAuth();
  const { state, onInteraction: contextInteraction } = useFirefly();

  // Use firefly context state if props not provided
  const effectiveIsVisible =
    isVisible !== undefined ? isVisible : state.isVisible;
  const effectiveTargetElement = targetElement || state.targetElement;
  const effectiveCelebrateEvent = celebrateEvent || state.celebrateEvent;

  // Set up global event listeners for celebrations
  useFireflyEvents();
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    defaultUserPreferences
  );
  const [position, setPosition] = useState<FireflyPosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isIdle, setIsIdle] = useState(true);
  const [trailPoints, setTrailPoints] = useState<FireflyPosition[]>([]);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTimeoutRef = useRef<number | undefined>(undefined);

  // Load user preferences to determine behavior mode
  useEffect(() => {
    if (userId) {
      const savedPrefs = localStorage.getItem(`preferences_${userId}`);
      if (savedPrefs) {
        try {
          setUserPreferences(JSON.parse(savedPrefs));
        } catch (error) {
          console.error('Error loading user preferences for firefly:', error);
        }
      }
    }
  }, [userId]);

  // Determine active mode (prop overrides user preference)
  const activeMode =
    mode || userPreferences.communication.style || 'empathetic';

  // Initialize position on mount
  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          x: rect.width - 60, // Start in top-right corner
          y: 40,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  // Update trail points for empathetic mode
  const updateTrail = useCallback(
    (newPosition: FireflyPosition) => {
      if (activeMode === 'empathetic') {
        setTrailPoints(prev => {
          const newTrail = [newPosition, ...prev].slice(0, 8); // Keep 8 trail points
          return newTrail;
        });
      } else {
        setTrailPoints([]);
      }
    },
    [activeMode]
  );

  // Idle animation patterns
  const startIdleAnimation = useCallback(() => {
    if (!isVisible) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    // const _centerX = rect.width / 2;
    // const _centerY = rect.height / 2;

    if (activeMode === 'pragmatic') {
      // Pragmatic: Subtle, purposeful movement in corner
      const idleX = rect.width - 80;
      const idleY = 60;

      controls.start({
        x: [idleX - 10, idleX + 10, idleX],
        y: [idleY - 5, idleY + 5, idleY],
        scale: [1, 1.1, 1],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      });
    } else {
      // Empathetic: Organic, wandering movement
      const generatePath = () => {
        const points = [];
        for (let i = 0; i < 6; i++) {
          points.push({
            x: Math.random() * (rect.width - 100) + 50,
            y: Math.random() * (rect.height - 100) + 50,
          });
        }
        return points;
      };

      const path = generatePath();
      const pathX = path.map(p => p.x);
      const pathY = path.map(p => p.y);

      controls.start({
        x: pathX,
        y: pathY,
        transition: {
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          onUpdate: (latest: { x?: number; y?: number }) => {
            if (typeof latest.x === 'number' && typeof latest.y === 'number') {
              updateTrail({ x: latest.x, y: latest.y });
            }
          },
        },
      });
    }
  }, [activeMode, controls, isVisible, updateTrail]);

  // Guide to target element
  const guideToTarget = useCallback(async () => {
    if (!effectiveTargetElement || !containerRef.current) return;

    const container = containerRef.current;
    const targetEl = document.querySelector(
      effectiveTargetElement
    ) as HTMLElement;
    if (!targetEl) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    // Calculate relative position
    const targetX = targetRect.left - containerRect.left + targetRect.width / 2;
    const targetY = targetRect.top - containerRect.top + targetRect.height / 2;

    setIsIdle(false);

    if (activeMode === 'pragmatic') {
      // Direct, efficient movement
      await controls.start({
        x: targetX,
        y: targetY,
        scale: [1, 1.2, 1],
        transition: {
          duration: 0.8,
          ease: 'easeOut',
        },
      });

      // Pulse at target
      await controls.start({
        scale: [1, 1.3, 1, 1.3, 1],
        transition: {
          duration: 1,
          ease: 'easeInOut',
        },
      });
    } else {
      // Organic, curved path
      const currentPos = position;
      const midX = (currentPos.x + targetX) / 2 + (Math.random() - 0.5) * 100;
      const midY = (currentPos.y + targetY) / 2 - 50;

      await controls.start({
        x: [currentPos.x, midX, targetX],
        y: [currentPos.y, midY, targetY],
        transition: {
          duration: 1.5,
          ease: 'easeInOut',
          onUpdate: (latest: { x?: number; y?: number }) => {
            if (typeof latest.x === 'number' && typeof latest.y === 'number') {
              updateTrail({ x: latest.x, y: latest.y });
            }
          },
        },
      });

      // Gentle circle around target
      const radius = 30;
      await controls.start({
        x: [
          targetX + radius,
          targetX,
          targetX - radius,
          targetX,
          targetX + radius,
        ],
        y: [targetY, targetY - radius, targetY, targetY + radius, targetY],
        transition: {
          duration: 2,
          ease: 'easeInOut',
          onUpdate: (latest: { x?: number; y?: number }) => {
            if (typeof latest.x === 'number' && typeof latest.y === 'number') {
              updateTrail({ x: latest.x, y: latest.y });
            }
          },
        },
      });
    }

    // Return to idle position
    setTimeout(() => {
      setIsIdle(true);
      startIdleAnimation();
    }, 1000);
  }, [
    effectiveTargetElement,
    activeMode,
    controls,
    position,
    updateTrail,
    startIdleAnimation,
  ]);

  // Celebration animation
  const celebrate = useCallback(async () => {
    if (!effectiveIsVisible || !effectiveCelebrateEvent) return;

    setIsIdle(false);

    if (activeMode === 'pragmatic') {
      // Efficient celebration - quick sparkle burst
      await controls.start({
        scale: [1, 1.5, 1.2, 1],
        rotate: [0, 180, 360],
        transition: {
          duration: 1.2,
          ease: 'easeOut',
        },
      });
    } else {
      // Joyful, organic celebration
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Excited spiral dance
      const spiralPoints = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        const radius = 50 + i * 8;
        spiralPoints.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        });
      }

      await controls.start({
        x: spiralPoints.map(p => p.x),
        y: spiralPoints.map(p => p.y),
        scale: [1, 1.3, 1.1, 1],
        rotate: [0, 720],
        transition: {
          duration: 3,
          ease: 'easeInOut',
          onUpdate: (latest: { x?: number; y?: number }) => {
            if (typeof latest.x === 'number' && typeof latest.y === 'number') {
              updateTrail({ x: latest.x, y: latest.y });
            }
          },
        },
      });
    }

    // Return to idle
    setTimeout(() => {
      setIsIdle(true);
      startIdleAnimation();
    }, 500);
  }, [
    effectiveCelebrateEvent,
    activeMode,
    controls,
    effectiveIsVisible,
    updateTrail,
    startIdleAnimation,
  ]);

  // Handle target element changes
  useEffect(() => {
    if (effectiveTargetElement && effectiveIsVisible) {
      guideToTarget();
    }
  }, [effectiveTargetElement, guideToTarget, effectiveIsVisible]);

  // Handle celebration events
  useEffect(() => {
    if (effectiveCelebrateEvent && effectiveIsVisible) {
      celebrate();
    }
  }, [effectiveCelebrateEvent, celebrate, effectiveIsVisible]);

  // Start idle animation when visible
  useEffect(() => {
    if (effectiveIsVisible && isIdle) {
      // Delay to allow position initialization
      const timeout = setTimeout(startIdleAnimation, 100);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [effectiveIsVisible, isIdle, startIdleAnimation]);

  // Reset idle timer on user interaction
  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }

      idleTimeoutRef.current = setTimeout(() => {
        if (!effectiveTargetElement && !effectiveCelebrateEvent) {
          setIsIdle(true);
          startIdleAnimation();
        }
      }, 3000);
    };

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [
    targetElement,
    celebrateEvent,
    startIdleAnimation,
    effectiveCelebrateEvent,
    effectiveTargetElement,
  ]);

  if (!effectiveIsVisible) return null;

  return (
    <div
      ref={containerRef}
      className='fixed inset-0 pointer-events-none z-50'
      style={{ position: 'fixed' }}
    >
      {/* Trail points for empathetic mode */}
      <AnimatePresence>
        {activeMode === 'empathetic' &&
          trailPoints.map((point, index) => (
            <motion.div
              key={`trail-${index}`}
              className='absolute w-1 h-1 bg-yellow-300/40 rounded-full'
              style={{ left: point.x, top: point.y }}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, delay: index * 0.1 }}
            />
          ))}
      </AnimatePresence>

      {/* Main firefly */}
      <motion.div
        animate={controls}
        className='absolute pointer-events-auto cursor-pointer'
        style={{ x: position.x, y: position.y }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        onClick={() => {
          onInteraction?.();
          contextInteraction();
        }}
        onTap={() => {
          onInteraction?.();
          contextInteraction();
        }}
      >
        {/* Firefly glow effect */}
        <motion.div
          className='absolute inset-0 rounded-full'
          animate={{
            boxShadow: [
              '0 0 10px rgba(255, 255, 0, 0.3)',
              '0 0 20px rgba(255, 255, 0, 0.5)',
              '0 0 10px rgba(255, 255, 0, 0.3)',
            ],
          }}
          transition={{
            duration: activeMode === 'pragmatic' ? 3 : 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Firefly body */}
        <motion.div
          className='w-4 h-4 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-lg'
          animate={{
            scale: isHovering ? 1.3 : 1,
            filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
          }}
          transition={{
            scale: { duration: 0.2 },
            filter: {
              duration: activeMode === 'pragmatic' ? 3 : 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        />

        {/* Wing flutter effect */}
        <motion.div
          className='absolute -top-1 -left-1 w-2 h-2'
          animate={{ rotate: [0, 15, -15, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 0.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className='w-full h-full bg-gradient-to-br from-blue-200/50 to-purple-200/50 rounded-full blur-sm' />
        </motion.div>

        <motion.div
          className='absolute -top-1 -right-1 w-2 h-2'
          animate={{ rotate: [0, -15, 15, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.1,
          }}
        >
          <div className='w-full h-full bg-gradient-to-br from-blue-200/50 to-purple-200/50 rounded-full blur-sm' />
        </motion.div>

        {/* Interactive tooltip */}
        <AnimatePresence>
          {isHovering && (
            <motion.div
              className='absolute -top-12 -left-16 bg-black/80 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap'
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              Sofia - Your Garden Guide
              <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/80' />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SofiaFirefly;
