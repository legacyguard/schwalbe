
/**
 * Interactive Garden Enhancements
 * Adds continuous subtle animations and celebration effects to make the Living Garden truly alive
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimationSystem } from '@/lib/animation-system';
import type { PersonalityMode } from '@/lib/sofia-types';

interface TreeLeafProps {
  color?: string;
  delay?: number;
  personalityMode?: PersonalityMode;
  size?: 'large' | 'medium' | 'small';
  x: number;
  y: number;
}

interface SofiaFireflyProps {
  containerHeight?: number;
  containerWidth?: number;
  isActive?: boolean;
  onFireflyClick?: () => void;
  personalityMode?: PersonalityMode;
}

interface CelebrationFireflyProps {
  index: number;
  onComplete?: () => void;
  x: number;
  y: number;
}

interface MilestoneGlowProps {
  color?: string;
  duration?: number;
  elementId: string;
  intensity?: 'bright' | 'medium' | 'subtle';
}

interface InteractiveGardenEnhancementsProps {
  activeCelebrations?: string[];
  className?: string;
  containerHeight?: number;

  containerWidth?: number;
  // Milestone glow
  glowingElements?: string[];

  leafCount?: number;
  onCelebrationComplete?: (celebrationId: string) => void;

  // Event handlers
  onFireflyClick?: () => void;

  // General settings
  personalityMode?: PersonalityMode;
  reducedMotion?: boolean;
  // Celebration effects
  showCelebrations?: boolean;
  // Tree animations
  showLeafMovement?: boolean;

  // Sofia firefly
  showSofiaFirefly?: boolean;
  sofiaFireflyActive?: boolean;

  treeElements?: Array<{ id: string; x: number; y: number }>;
}

/**
 * Animated Tree Leaf Component
 * Creates subtle, continuous wind-like movement for leaves on trees
 */
export const TreeLeaf: React.FC<TreeLeafProps> = ({
  x,
  y,
  size = 'medium',
  color = 'text-green-500',
  personalityMode = 'adaptive',
  delay = 0,
}) => {
  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();

  // Personality-aware animation parameters
  const getAnimationParams = () => {
    switch (personalityMode) {
      case 'empathetic':
        return {
          duration: 4 + Math.random() * 2,
          amplitude: { x: 8, y: 6 },
          rotation: 15,
          opacity: [0.7, 1, 0.8, 1],
        };
      case 'pragmatic':
        return {
          duration: 2.5 + Math.random() * 1,
          amplitude: { x: 4, y: 3 },
          rotation: 8,
          opacity: [0.8, 1, 0.9, 1],
        };
      default:
        return {
          duration: 3 + Math.random() * 1.5,
          amplitude: { x: 6, y: 4 },
          rotation: 12,
          opacity: [0.75, 1, 0.85, 1],
        };
    }
  };

  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4',
  };

  const params = getAnimationParams();

  if (shouldReduceMotion) {
    return (
      <div
        className={cn('absolute', sizeClasses[size], color)}
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        🍃
      </div>
    );
  }

  return (
    <motion.div
      className={cn('absolute', sizeClasses[size], color)}
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{
        x: [
          0,
          params.amplitude.x,
          -params.amplitude.x * 0.7,
          params.amplitude.x * 0.3,
          0,
        ],
        y: [
          0,
          -params.amplitude.y * 0.5,
          params.amplitude.y * 0.3,
          -params.amplitude.y * 0.2,
          0,
        ],
        rotate: [
          -params.rotation * 0.5,
          params.rotation,
          -params.rotation * 0.3,
          params.rotation * 0.7,
          -params.rotation * 0.5,
        ],
        opacity: params.opacity,
      }}
      transition={{
        duration: params.duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay,
      }}
    >
      🍃
    </motion.div>
  );
};

/**
 * Sofia Firefly Component
 * Creates a floating Sofia firefly that moves around the garden continuously
 */
export const SofiaFirefly: React.FC<SofiaFireflyProps> = ({
  isActive = true,
  personalityMode = 'adaptive',
  containerWidth: _containerWidth = 400,
  containerHeight: _containerHeight = 300,
  onFireflyClick,
}) => {
  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();
  const [currentPath, setCurrentPath] = useState(0);

  // Generate organic flight paths based on personality
  const getFlightPaths = () => {
    const paths = {
      empathetic: [
        // Gentle, heart-like patterns
        { x: [20, 35, 50, 35, 20], y: [30, 20, 30, 40, 30] },
        { x: [60, 75, 80, 65, 60], y: [25, 15, 35, 45, 25] },
        { x: [25, 40, 60, 80, 70, 50, 25], y: [50, 35, 30, 45, 65, 70, 50] },
      ],
      pragmatic: [
        // Efficient, structured paths
        { x: [20, 80, 80, 20, 20], y: [20, 20, 60, 60, 20] },
        { x: [30, 70, 50, 30], y: [30, 30, 50, 30] },
        { x: [40, 60, 60, 40, 40], y: [25, 25, 45, 45, 25] },
      ],
      adaptive: [
        // Balanced, natural curves
        { x: [25, 50, 75, 60, 40, 25], y: [35, 20, 35, 55, 60, 35] },
        { x: [70, 50, 30, 45, 70], y: [25, 40, 30, 55, 25] },
        { x: [30, 60, 80, 50, 20, 30], y: [45, 25, 50, 70, 55, 45] },
      ],
    };

    return paths[personalityMode] || paths.adaptive;
  };

  const flightPaths = getFlightPaths();

  // Cycle through paths
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(
      () => {
        setCurrentPath(prev => (prev + 1) % flightPaths.length);
      },
      personalityMode === 'empathetic'
        ? 12000
        : personalityMode === 'pragmatic'
          ? 8000
          : 10000
    );

    return () => clearInterval(interval);
  }, [isActive, personalityMode, flightPaths.length]);

  if (!isActive || shouldReduceMotion) {
    return (
      <div
        className='absolute w-4 h-4 cursor-pointer hover:scale-110 transition-transform'
        style={{ left: '75%', top: '25%' }}
        onClick={onFireflyClick}
      >
        <Sparkles className='w-4 h-4 text-yellow-400' />
      </div>
    );
  }

  const currentFlightPath = flightPaths[currentPath];
  const duration =
    personalityMode === 'empathetic'
      ? 8 + Math.random() * 4
      : personalityMode === 'pragmatic'
        ? 4 + Math.random() * 2
        : 6 + Math.random() * 3;

  return (
    <motion.div
      className='absolute w-4 h-4 cursor-pointer hover:scale-110 transition-transform z-10'
      animate={{
        x: currentFlightPath?.x.map(x => `${x}%`) || ['0%'],
        y: currentFlightPath?.y.map(y => `${y}%`) || ['0%'],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        repeatType: 'reverse',
      }}
      onClick={onFireflyClick}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        animate={{
          opacity: [0.6, 1, 0.8, 1],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Sparkles className='w-4 h-4 text-yellow-400 drop-shadow-sm' />
      </motion.div>

      {/* Glow effect */}
      <motion.div
        className='absolute inset-0 bg-yellow-300 rounded-full blur-sm opacity-30'
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};

/**
 * Celebration Firefly Component
 * Creates multiple fireflies that appear during milestone celebrations
 */
export const CelebrationFirefly: React.FC<CelebrationFireflyProps> = ({
  x,
  y,
  index,
  onComplete,
}) => {
  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();

  if (shouldReduceMotion) {
    return (
      <div className='absolute w-3 h-3' style={{ left: `${x}%`, top: `${y}%` }}>
        <Sparkles className='w-3 h-3 text-yellow-300' />
      </div>
    );
  }

  return (
    <motion.div
      className='absolute w-3 h-3 pointer-events-none'
      initial={{
        x: `${x}%`,
        y: `${y}%`,
        scale: 0,
        opacity: 0,
      }}
      animate={{
        x: `${x + (Math.random() - 0.5) * 40}%`,
        y: `${y + (Math.random() - 0.5) * 30}%`,
        scale: [0, 1.2, 1, 0],
        opacity: [0, 1, 0.8, 0],
        rotate: 360,
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      onAnimationComplete={onComplete || (() => {})}
    >
      <Sparkles className='w-3 h-3 text-yellow-300' />
    </motion.div>
  );
};

/**
 * Milestone Glow Effect Component
 * Creates a subtle glow around newly achieved elements
 */
export const MilestoneGlow: React.FC<MilestoneGlowProps> = ({
  elementId: _elementId,
  duration = 3000,
  color = 'text-yellow-400',
  intensity = 'medium',
}) => {
  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();

  const intensityConfig = {
    subtle: { scale: [1, 1.1, 1], opacity: [1, 0.8, 1], blur: 'blur-sm' },
    medium: { scale: [1, 1.15, 1], opacity: [1, 0.7, 1], blur: 'blur-md' },
    bright: { scale: [1, 1.25, 1], opacity: [1, 0.5, 1], blur: 'blur-lg' },
  };

  const config = intensityConfig[intensity];

  if (shouldReduceMotion) {
    return (
      <div
        className={`absolute inset-0 ${color} opacity-20 rounded-full ${config.blur}`}
      />
    );
  }

  return (
    <motion.div
      className={`absolute inset-0 ${color} rounded-full ${config.blur} pointer-events-none`}
      animate={{
        scale: config.scale,
        opacity: config.opacity,
      }}
      transition={{
        duration: duration / 1000,
        repeat: 2,
        ease: 'easeInOut',
      }}
    />
  );
};

/**
 * Main Interactive Garden Enhancements Component
 * Orchestrates all the interactive elements
 */
export const InteractiveGardenEnhancements: React.FC<
  InteractiveGardenEnhancementsProps
> = ({
  showLeafMovement = true,
  leafCount = 12,
  treeElements = [],
  showSofiaFirefly = true,
  sofiaFireflyActive = true,
  showCelebrations = true,
  activeCelebrations = [],
  glowingElements = [],
  personalityMode = 'adaptive',
  containerWidth = 400,
  containerHeight = 300,
  reducedMotion = false,
  onFireflyClick,
  onCelebrationComplete,
  className,
}) => {
  const [celebrationFireflies, setCelebrationFireflies] = useState<
    Array<{ id: string; x: number; y: number }>
  >([]);

  // Generate random leaf positions around tree elements
  const generateLeafPositions = () => {
    const leaves: Array<{ delay: number; x: number; y: number }> = [];

    treeElements.forEach((tree, treeIndex) => {
      const leavesPerTree = Math.ceil(
        leafCount / Math.max(treeElements.length, 1)
      );

      for (let i = 0; i < leavesPerTree; i++) {
        leaves.push({
          x: tree.x + (Math.random() - 0.5) * 20, // Spread around tree
          y: tree.y + (Math.random() - 0.5) * 15,
          delay: treeIndex * 0.5 + i * 0.2,
        });
      }
    });

    // If no tree elements, generate random positions
    if (treeElements.length === 0) {
      for (let i = 0; i < leafCount; i++) {
        leaves.push({
          x: 20 + Math.random() * 60,
          y: 30 + Math.random() * 40,
          delay: i * 0.3,
        });
      }
    }

    return leaves;
  };

  const leafPositions = generateLeafPositions();

  // Handle celebration triggers
  useEffect(() => {
    if (!showCelebrations || activeCelebrations.length === 0) return;

    // Generate celebration fireflies for each active celebration
    const newFireflies = activeCelebrations.flatMap(
      (celebrationId, celebrationIndex) => {
        const centerX =
          50 + (celebrationIndex - activeCelebrations.length / 2) * 20;
        const centerY = 40;

        return Array.from({ length: 8 }, (_, i) => ({
          id: `${celebrationId}-${i}`,
          x: centerX + (Math.random() - 0.5) * 30,
          y: centerY + (Math.random() - 0.5) * 20,
        }));
      }
    );

    setCelebrationFireflies(newFireflies);

    // Clear celebration fireflies after animation
    const timeout = setTimeout(() => {
      setCelebrationFireflies([]);
      activeCelebrations.forEach(id => onCelebrationComplete?.(id));
    }, 5000);

    return () => clearTimeout(timeout);
  }, [activeCelebrations, showCelebrations, onCelebrationComplete]);

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {/* Continuous Leaf Movement */}
      {showLeafMovement &&
        !reducedMotion &&
        leafPositions.map((leaf, index) => (
          <TreeLeaf
            key={`leaf-${index}`}
            x={leaf.x}
            y={leaf.y}
            personalityMode={personalityMode}
            delay={leaf.delay}
          />
        ))}

      {/* Sofia Firefly */}
      {showSofiaFirefly && (
        <div className='pointer-events-auto'>
          <SofiaFirefly
            isActive={sofiaFireflyActive}
            personalityMode={personalityMode}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
            onFireflyClick={onFireflyClick || (() => {})}
          />
        </div>
      )}

      {/* Celebration Fireflies */}
      <AnimatePresence>
        {celebrationFireflies.map((firefly, index) => (
          <CelebrationFirefly
            key={firefly.id}
            x={firefly.x}
            y={firefly.y}
            index={index}
            onComplete={() => {
              setCelebrationFireflies(prev =>
                prev.filter(f => f.id !== firefly.id)
              );
            }}
          />
        ))}
      </AnimatePresence>

      {/* Milestone Glow Effects */}
      {glowingElements.map(elementId => (
        <div
          key={`glow-${elementId}`}
          className='absolute inset-0 pointer-events-none'
        >
          <MilestoneGlow
            elementId={elementId}
            intensity={personalityMode === 'empathetic' ? 'bright' : 'medium'}
            color={
              personalityMode === 'empathetic'
                ? 'text-pink-300'
                : personalityMode === 'pragmatic'
                  ? 'text-blue-300'
                  : 'text-purple-300'
            }
          />
        </div>
      ))}
    </div>
  );
};

export default InteractiveGardenEnhancements;
