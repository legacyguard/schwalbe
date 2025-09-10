
import React, { useEffect, useRef, useState } from 'react';
import { styled, View } from 'tamagui';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { type SofiaMode, TextManager } from '@schwalbe/logic';
import { eventBus, EVENTS, useEventBus } from '../utils/eventBus';
import type { SofiaFireflyProps } from './SofiaFirefly.types';

const FireflyContainer = styled(View, {
  name: 'LGFireflyContainer',
  position: 'absolute',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 1000,
});

// Web version with Framer Motion
const SofiaFireflyWeb: React.FC<SofiaFireflyProps> = ({
  mode = 'balanced',
  isActive = true,
  message,
  startPosition = { x: 50, y: 50 },
}) => {
  const controls = useAnimation();
  const [currentMode, setCurrentMode] = useState<SofiaMode>(mode);
  const [showMessage, setShowMessage] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sofia = React.useMemo(() => new TextManager(mode), [mode]);

  // Update mode when prop changes
  useEffect(() => {
    setCurrentMode(mode);
    sofia.setMode(mode);
  }, [mode, sofia]);

  // Listen for events
  useEventBus(EVENTS.MILESTONE_UNLOCKED, async _milestone => {
    // Fly to tree location
    await controls.start({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      transition: { duration: 2, type: 'spring' },
    });

    // Celebrate animation
    await controls.start('celebrate');

    // Return to idle movement
    startIdleAnimation();
  });

  useEventBus(EVENTS.SOFIA_MODE_CHANGE, (...args: unknown[]) => {
    const newMode = args[0] as SofiaMode;
    setCurrentMode(newMode);
    sofia.setMode(newMode);
  });

  // Movement patterns based on mode
  const getMovementPattern = () => {
    switch (currentMode) {
      case 'empathetic':
        return {
          x: [
            startPosition.x,
            startPosition.x + 100,
            startPosition.x + 50,
            startPosition.x - 50,
            startPosition.x,
          ],
          y: [
            startPosition.y,
            startPosition.y - 30,
            startPosition.y + 60,
            startPosition.y - 20,
            startPosition.y,
          ],
          transition: {
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          },
        };
      case 'pragmatic':
        return {
          x: [
            startPosition.x,
            startPosition.x + 150,
            startPosition.x + 150,
            startPosition.x,
            startPosition.x,
          ],
          y: [
            startPosition.y,
            startPosition.y,
            startPosition.y + 100,
            startPosition.y + 100,
            startPosition.y,
          ],
          transition: {
            duration: 6,
            repeat: Infinity,
            ease: 'linear' as const,
          },
        };
      case 'balanced':
      default:
        return {
          x: [
            startPosition.x,
            startPosition.x + 80,
            startPosition.x + 120,
            startPosition.x + 40,
            startPosition.x,
          ],
          y: [
            startPosition.y,
            startPosition.y - 40,
            startPosition.y + 20,
            startPosition.y + 50,
            startPosition.y,
          ],
          transition: {
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          },
        };
    }
  };

  const startIdleAnimation = () => {
    if (isActive) {
      controls.start(getMovementPattern());
    }
  };

  useEffect(() => {
    startIdleAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentMode]);

  // Animation variants
  const fireflyVariants = {
    idle: {
      scale: 1,
      rotate: 0,
    },
    celebrate: {
      scale: [1, 1.5, 1],
      rotate: [0, 360, 0],
      transition: {
        duration: 1,
        ease: 'easeInOut' as const,
      },
    },
    hover: {
      scale: 1.2,
      transition: {
        duration: 0.3,
      },
    },
  };

  const glowVariants = {
    empathetic: {
      opacity: [0.4, 0.8, 0.4],
      scale: [1, 1.3, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    pragmatic: {
      opacity: 0.6,
      scale: 1,
    },
    balanced: {
      opacity: [0.5, 0.7, 0.5],
      scale: [1, 1.15, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <FireflyContainer ref={containerRef}>
      <motion.div
        animate={controls}
        initial={{ x: startPosition.x, y: startPosition.y }}
        style={{
          position: 'absolute',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
        onHoverStart={() => {
          controls.start('hover');
          setShowMessage(true);
        }}
        onHoverEnd={() => {
          controls.start('idle');
          setShowMessage(false);
        }}
        onClick={() => {
          eventBus.emit(
            EVENTS.SOFIA_MODE_CHANGE,
            currentMode === 'empathetic'
              ? 'pragmatic'
              : currentMode === 'pragmatic'
                ? 'balanced'
                : 'empathetic'
          );
        }}
      >
        <motion.svg
          width='60'
          height='60'
          viewBox='0 0 60 60'
          variants={fireflyVariants}
          animate='idle'
        >
          {/* Glow effect */}
          <motion.circle
            cx='30'
            cy='30'
            r='25'
            fill={
              currentMode === 'empathetic'
                ? '#FFE5B4'
                : currentMode === 'pragmatic'
                  ? '#B4D4FF'
                  : '#E5FFB4'
            }
            filter='blur(10px)'
            variants={glowVariants}
            animate={currentMode}
          />

          {/* Body */}
          <ellipse cx='30' cy='35' rx='8' ry='12' fill='#333' />

          {/* Head */}
          <circle cx='30' cy='22' r='6' fill='#333' />

          {/* Wings */}
          <motion.g
            animate={{
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              ease: 'linear' as const,
            }}
          >
            <ellipse
              cx='20'
              cy='30'
              rx='12'
              ry='6'
              fill='rgba(255, 255, 255, 0.6)'
              transform='rotate(-20 20 30)'
            />
            <ellipse
              cx='40'
              cy='30'
              rx='12'
              ry='6'
              fill='rgba(255, 255, 255, 0.6)'
              transform='rotate(20 40 30)'
            />
          </motion.g>

          {/* Eyes */}
          <circle cx='27' cy='22' r='2' fill='white' />
          <circle cx='33' cy='22' r='2' fill='white' />
          <circle cx='27' cy='22' r='1' fill='black' />
          <circle cx='33' cy='22' r='1' fill='black' />

          {/* Light */}
          <motion.circle
            cx='30'
            cy='38'
            r='4'
            fill={
              currentMode === 'empathetic'
                ? '#FFD700'
                : currentMode === 'pragmatic'
                  ? '#4169E1'
                  : '#90EE90'
            }
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />
        </motion.svg>

        {/* Message bubble */}
        <AnimatePresence>
          {showMessage && message && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: -70 }}
              exit={{ opacity: 0, scale: 0, y: -10 }}
              style={{
                position: 'absolute',
                background: 'white',
                padding: '8px 12px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                fontSize: '14px',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              {message}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid white',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </FireflyContainer>
  );
};

// Native version (simplified)
const SofiaFireflyNative: React.FC<SofiaFireflyProps> = ({
  mode = 'balanced',
}) => {
  return (
    <FireflyContainer>
      <View
        style={{
          position: 'absolute',
          width: 60,
          height: 60,
          backgroundColor: mode === 'empathetic' ? '#FFE5B4' : '#B4D4FF',
          borderRadius: 30,
          opacity: 0.8,
        }}
      />
    </FireflyContainer>
  );
};

// Export a component wrapper for fast-refresh compatibility
export const SofiaFirefly: React.FC<SofiaFireflyProps> = props => {
  const isWeb = typeof window !== 'undefined';
  return isWeb ? (
    <SofiaFireflyWeb {...props} />
  ) : (
    <SofiaFireflyNative {...props} />
  );
};
