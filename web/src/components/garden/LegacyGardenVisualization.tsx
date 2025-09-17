
/**
 * Legacy Garden Visualization Component
 * Interactive garden that grows with user progress and family protection milestones
 */

import { useEffect, useState } from 'react';
import { Cloud, Droplets, Sparkles, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePersonalityManager } from '@/components/sofia/SofiaContextProvider';
import { AnimationSystem } from '@/lib/animation-system';
import type { PersonalityMode } from '@/lib/sofia-types';
import { InteractiveGardenEnhancements } from './InteractiveGardenEnhancements';

interface GardenElement {
  color: string;
  emoji: string;
  id: string;
  milestone?: string;
  size: 'large' | 'medium' | 'small';
  type: 'bird' | 'butterfly' | 'flower' | 'seed' | 'sprout' | 'tree';
  unlocked: boolean;
  x: number;
  y: number;
}

interface WeatherEffect {
  active: boolean;
  intensity: number;
  type: 'rain' | 'sparkles' | 'sun';
}

interface LegacyGardenVisualizationProps {
  achievedMilestones: string[];
  animated?: boolean;
  className?: string;
  documentsCount: number;
  emergencyContactsCount: number;
  familyMembersCount: number;
  interactive?: boolean;
  onElementClick?: (element: GardenElement) => void;
  onSofiaFireflyClick?: () => void;
  personalityMode?: PersonalityMode;
  protectionDays: number;
  recentlyCompletedMilestones?: string[];
  // Interactive Garden Enhancement props
  showInteractiveEnhancements?: boolean;

  showWeather?: boolean;
  trustScore: number;
  variant?: 'background' | 'compact' | 'full';

  willCompleted: boolean;
}

export function LegacyGardenVisualization({
  documentsCount = 0,
  familyMembersCount = 0,
  emergencyContactsCount = 0,
  willCompleted = false,
  trustScore = 0,
  protectionDays = 0,
  achievedMilestones = [],
  variant = 'full',
  animated = true,
  interactive = true,
  showWeather = true,
  personalityMode,
  onElementClick,

  // Interactive Garden Enhancement props
  showInteractiveEnhancements = true,
  recentlyCompletedMilestones = [],
  onSofiaFireflyClick,

  className,
}: LegacyGardenVisualizationProps) {
  const personalityManager = usePersonalityManager();

  // Get personality mode from prop or context
  const detectedMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const effectiveMode =
    personalityMode ||
    (detectedMode === 'balanced' ? 'adaptive' : detectedMode);

  // Check for reduced motion
  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();

  const [gardenElements, setGardenElements] = useState<GardenElement[]>([]);
  const [weather, setWeather] = useState<WeatherEffect>({
    type: 'sun',
    active: true,
    intensity: 0.5,
  });
  const [hoveredElement, setHoveredElement] = useState<null | string>(null);
  const [gardenStage, setGardenStage] = useState<
    'blooming' | 'empty' | 'flourishing' | 'growing' | 'seeded'
  >('empty');

  // Interactive enhancement state
  const [activeCelebrations, setActiveCelebrations] = useState<string[]>([]);
  const [glowingElements, setGlowingElements] = useState<string[]>([]);
  const [previousMilestoneCount, setPreviousMilestoneCount] = useState(0);

  // Calculate garden stage based on progress
  useEffect(() => {
    const totalProgress =
      documentsCount +
      familyMembersCount * 2 +
      emergencyContactsCount * 1.5 +
      (willCompleted ? 5 : 0) +
      trustScore / 20;

    if (totalProgress >= 20) setGardenStage('flourishing');
    else if (totalProgress >= 12) setGardenStage('blooming');
    else if (totalProgress >= 6) setGardenStage('growing');
    else if (totalProgress >= 1) setGardenStage('seeded');
    else setGardenStage('empty');
  }, [
    documentsCount,
    familyMembersCount,
    emergencyContactsCount,
    willCompleted,
    trustScore,
  ]);

  // Generate garden elements based on progress and personality
  useEffect(() => {
    const elements: GardenElement[] = [];
    // Animation configuration for the effective mode
    AnimationSystem.getConfig(effectiveMode);

    // Seeds for first documents (up to 5) - personality-aware positioning
    const seedSpacing =
      effectiveMode === 'empathetic'
        ? 18
        : effectiveMode === 'pragmatic'
          ? 12
          : 15;
    for (let i = 0; i < Math.min(documentsCount, 5); i++) {
      elements.push({
        id: `seed_${i}`,
        type: i < documentsCount ? 'sprout' : 'seed',
        x:
          20 +
          i * seedSpacing +
          (effectiveMode === 'empathetic' ? Math.random() * 5 - 2.5 : 0),
        y:
          70 +
          (effectiveMode === 'empathetic'
            ? Math.random() * 15 - 7.5
            : Math.random() * 10 - 5),
        size: effectiveMode === 'empathetic' ? 'medium' : 'small',
        color:
          effectiveMode === 'empathetic'
            ? 'text-green-500'
            : effectiveMode === 'pragmatic'
              ? 'text-green-600'
              : 'text-green-400',
        emoji:
          i < documentsCount
            ? effectiveMode === 'empathetic'
              ? '🌿'
              : '🌱'
            : '🌰',
        unlocked: i < documentsCount,
        milestone: `Document ${i + 1} uploaded`,
      });
    }

    // Family member flowers - personality-aware varieties
    const familyEmojis = {
      empathetic: ['🌸', '🌺', '💐', '🌻', '🌹', '🌷', '🌼'],
      pragmatic: ['🌻', '🌹', '🌷', '🌼', '🌺'],
      adaptive: ['🌸', '🌺', '💐', '🌻', '🌹'],
    };

    for (let i = 0; i < familyMembersCount; i++) {
      elements.push({
        id: `family_${i}`,
        type: 'flower',
        x:
          15 +
          i * (effectiveMode === 'empathetic' ? 25 : 20) +
          (effectiveMode === 'empathetic'
            ? Math.random() * 15
            : Math.random() * 10),
        y:
          50 +
          (effectiveMode === 'empathetic'
            ? Math.random() * 20
            : Math.random() * 15),
        size: effectiveMode === 'empathetic' ? 'large' : 'medium',
        color:
          effectiveMode === 'empathetic'
            ? 'text-pink-400'
            : effectiveMode === 'pragmatic'
              ? 'text-purple-600'
              : 'text-pink-500',
        emoji:
          familyEmojis[effectiveMode][i % familyEmojis[effectiveMode].length] || '👤',
        unlocked: true,
        milestone: `Family member ${i + 1} protected`,
      });
    }

    // Emergency contact butterflies
    for (let i = 0; i < emergencyContactsCount; i++) {
      elements.push({
        id: `emergency_${i}`,
        type: 'butterfly',
        x: 30 + i * 25 + Math.random() * 20,
        y: 20 + Math.random() * 20,
        size: 'small',
        color: 'text-blue-500',
        emoji: ['🦋', '🐝', '🐛'][i % 3] || '🦋',
        unlocked: true,
        milestone: `Emergency contact ${i + 1} added`,
      });
    }

    // Will completion tree
    if (willCompleted) {
      elements.push({
        id: 'will_tree',
        type: 'tree',
        x: 50 + Math.random() * 20,
        y: 60,
        size: 'large',
        color: 'text-green-700',
        emoji: '🌳',
        unlocked: true,
        milestone: 'Will completed',
      });
    }

    // Trust score birds (every 25 points)
    const birdCount = Math.floor(trustScore / 25);
    for (let i = 0; i < birdCount; i++) {
      elements.push({
        id: `trust_bird_${i}`,
        type: 'bird',
        x: 10 + i * 30 + Math.random() * 15,
        y: 10 + Math.random() * 20,
        size: 'small',
        color: 'text-yellow-600',
        emoji: ['🐦', '🕊️', '🦅', '🦜'][i % 4] || '🐦',
        unlocked: true,
        milestone: `Trust score milestone: ${(i + 1) * 25} points`,
      });
    }

    // Special milestone elements
    if (achievedMilestones.includes('protection_foundation')) {
      elements.push({
        id: 'foundation_castle',
        type: 'tree',
        x: 75,
        y: 65,
        size: 'large',
        color: 'text-purple-600',
        emoji: '🏰',
        unlocked: true,
        milestone: 'Protection foundation built',
      });
    }

    if (protectionDays >= 30) {
      elements.push({
        id: 'time_rainbow',
        type: 'flower',
        x: 80,
        y: 30,
        size: 'medium',
        color: 'text-indigo-500',
        emoji: '🌈',
        unlocked: true,
        milestone: `${protectionDays} days of protection`,
      });
    }

    setGardenElements(elements);
  }, [
    documentsCount,
    familyMembersCount,
    emergencyContactsCount,
    willCompleted,
    trustScore,
    protectionDays,
    achievedMilestones,
    effectiveMode,
  ]);

  // Weather effects based on recent activity and personality
  useEffect(() => {
    let intensity = 0.5;
    let weatherType: WeatherEffect['type'] = 'sun';

    // Base weather on garden stage
    if (documentsCount === 0) {
      weatherType = 'sun';
      intensity = 0.3;
    } else if (gardenStage === 'seeded' || gardenStage === 'growing') {
      weatherType = effectiveMode === 'empathetic' ? 'rain' : 'sun';
      intensity = effectiveMode === 'empathetic' ? 0.7 : 0.4;
    } else if (gardenStage === 'blooming' || gardenStage === 'flourishing') {
      weatherType = 'sparkles';
      intensity =
        effectiveMode === 'empathetic'
          ? 0.9
          : effectiveMode === 'pragmatic'
            ? 0.6
            : 0.8;
    }

    setWeather({ type: weatherType, active: true, intensity });
  }, [gardenStage, documentsCount, effectiveMode]);

  // Handle milestone celebrations
  useEffect(() => {
    if (!showInteractiveEnhancements) return;

    const currentMilestoneCount = achievedMilestones.length;

    // Trigger celebration for new milestones
    if (
      currentMilestoneCount > previousMilestoneCount &&
      previousMilestoneCount > 0
    ) {
      const newCelebrationId = `milestone-${Date.now()}`;
      setActiveCelebrations(prev => [...prev, newCelebrationId]);

      // Add glow effect to newly achieved elements
      const newAchievedMilestones = achievedMilestones.slice(
        previousMilestoneCount
      );
      setGlowingElements(prev => [...prev, ...newAchievedMilestones]);

      // Clear glow effect after 3 seconds
      setTimeout(() => {
        setGlowingElements(prev =>
          prev.filter(id => !newAchievedMilestones.includes(id))
        );
      }, 3000);
    }

    setPreviousMilestoneCount(currentMilestoneCount);
  }, [
    achievedMilestones.length,
    previousMilestoneCount,
    showInteractiveEnhancements,
  ]);

  // Handle recently completed milestones for immediate celebration
  useEffect(() => {
    if (recentlyCompletedMilestones && recentlyCompletedMilestones.length > 0) {
      const celebrationId = `recent-${Date.now()}`;
      setActiveCelebrations(prev => [...prev, celebrationId]);
      setGlowingElements(prev => [...prev, ...recentlyCompletedMilestones]);

      // Clear celebration after animation
      setTimeout(() => {
        setActiveCelebrations(prev => prev.filter(id => id !== celebrationId));
      }, 5000);

      setTimeout(() => {
        setGlowingElements(prev =>
          prev.filter(id => !recentlyCompletedMilestones.includes(id))
        );
      }, 3000);
    }
  }, [recentlyCompletedMilestones]);

  const getGardenMessage = () => {
    const messages = {
      empathetic: {
        empty:
          "Your heart's garden awaits the first gentle seed of love and protection 💚",
        seeded:
          'Beautiful beginnings! Your seeds of care are taking root with tender hope 🌿',
        growing:
          "How wonderful! Your family's garden grows stronger with each act of love 🌸",
        blooming:
          'Your heart is blooming! This garden reflects the love you share with family 🌺',
        flourishing:
          'Breathtaking! Your legacy garden flourishes with the depth of your caring spirit 🌈',
      },
      pragmatic: {
        empty:
          'Garden initialization ready. Plant your first protection seed to begin 🌱',
        seeded:
          'Protection protocols active. Document security systems are growing 🌿',
        growing:
          'System expansion in progress. Family protection network strengthening 🌸',
        blooming:
          'Optimal growth achieved. Your protection systems are fully operational 🌺',
        flourishing:
          'Maximum efficiency reached. Comprehensive family protection network established 🌈',
      },
      adaptive: {
        empty: 'Your legacy garden awaits the first seed of protection 🌱',
        seeded: 'Seeds of protection have been planted - watch them grow! 🌿',
        growing:
          "Your family's garden is growing strong with each loving action 🌸",
        blooming:
          'Beautiful! Your garden blooms with family protection and care 🌺',
        flourishing:
          'Magnificent! Your legacy garden flourishes with comprehensive protection 🌈',
      },
    };

    return (
      messages[effectiveMode][gardenStage] ||
      'Your legacy garden is taking shape...'
    );
  };

  const renderWeatherEffect = () => {
    if (!showWeather || !weather.active) return null;

    if (weather.type === 'sparkles') {
      return (
        <>
          {Array.from({ length: Math.floor(weather.intensity * 8) }).map(
            (_, i) => (
              <motion.div
                key={`sparkle_${i}`}
                className='absolute pointer-events-none'
                initial={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  scale: 0,
                  opacity: 0,
                }}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: 360 }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <Sparkles className='h-3 w-3 text-yellow-400' />
              </motion.div>
            )
          )}
        </>
      );
    }

    if (weather.type === 'rain') {
      return (
        <>
          {Array.from({ length: Math.floor(weather.intensity * 12) }).map(
            (_, i) => (
              <motion.div
                key={`rain_${i}`}
                className='absolute pointer-events-none'
                initial={{
                  x: Math.random() * 100 + '%',
                  y: '-5%',
                  opacity: 0.4,
                }}
                animate={{ y: '105%', opacity: [0.4, 0.6, 0] }}
                transition={{
                  duration: 1.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: Math.random() * 1.5,
                  ease: 'linear',
                }}
              >
                <Droplets className='h-2 w-2 text-blue-400' />
              </motion.div>
            )
          )}
        </>
      );
    }

    if (weather.type === 'sun') {
      return (
        <motion.div
          className='absolute top-4 right-4 pointer-events-none'
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Sun className='h-8 w-8 text-yellow-500 opacity-60' />
        </motion.div>
      );
    }

    return null;
  };

  const renderGardenElement = (element: GardenElement) => {
    const animConfig = AnimationSystem.getConfig(effectiveMode);
    const delayMultiplier =
      effectiveMode === 'pragmatic'
        ? 0.05
        : effectiveMode === 'empathetic'
          ? 0.15
          : 0.1;

    return (
      <motion.div
        key={element.id}
        className={cn(
          'absolute cursor-pointer transition-transform duration-200',
          hoveredElement === element.id && interactive && 'scale-110',
          element.color
        )}
        style={{
          left: `${element.x}%`,
          top: `${element.y}%`,
          opacity: element.unlocked ? 1 : 0.3,
        }}
        initial={
          animated && !shouldReduceMotion
            ? { scale: 0, opacity: 0, y: 20 }
            : false
        }
        animate={
          animated && !shouldReduceMotion
            ? {
                scale: 1,
                opacity: element.unlocked ? 1 : 0.3,
                y: 0,
              }
            : false
        }
        transition={
          animated && !shouldReduceMotion
            ? {
                duration: animConfig.duration,
                delay: gardenElements.indexOf(element) * delayMultiplier,
                ease: animConfig.ease as any,
                type: effectiveMode === 'pragmatic' ? 'tween' : 'spring',
              }
            : undefined
        }
        whileHover={
          interactive && !shouldReduceMotion
            ? {
                scale: effectiveMode === 'empathetic' ? 1.3 : 1.2,
                rotate: effectiveMode === 'empathetic' ? [-2, 2, -2, 0] : 0,
              }
            : undefined
        }
        onHoverStart={() => interactive && setHoveredElement(element.id)}
        onHoverEnd={() => setHoveredElement(null)}
        onClick={() => interactive && onElementClick?.(element)}
      >
        <div className='text-2xl select-none'>{element.emoji}</div>

        {element.type === 'butterfly' && animated && !shouldReduceMotion && (
          <motion.div
            animate={{
              x:
                effectiveMode === 'empathetic'
                  ? [0, 15, -8, 20, 0]
                  : [0, 10, -5, 15, 0],
              y:
                effectiveMode === 'empathetic'
                  ? [0, -12, 5, -18, 0]
                  : [0, -8, 3, -12, 0],
            }}
            transition={{
              duration:
                effectiveMode === 'empathetic'
                  ? 5 + Math.random() * 3
                  : 4 + Math.random() * 2,
              repeat: Infinity,
              ease: animConfig.ease as any,
            }}
            className='absolute inset-0'
          >
            <div className='text-2xl select-none'>{element.emoji}</div>
          </motion.div>
        )}

        {hoveredElement === element.id && interactive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10'
          >
            {element.milestone}
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'relative w-full h-24 bg-gradient-to-b from-sky-100 to-green-100 rounded-lg overflow-hidden',
          className
        )}
      >
        {/* Ground line */}
        <div className='absolute bottom-0 w-full h-8 bg-gradient-to-t from-green-200 to-transparent' />

        {/* Elements (simplified for compact view) */}
        <div className='relative w-full h-full'>
          {gardenElements.slice(0, 5).map(renderGardenElement)}
        </div>

        {/* Message overlay */}
        <div className='absolute bottom-2 left-2 text-xs font-medium text-green-800 bg-white/70 px-2 py-1 rounded'>
          {gardenStage !== 'empty' ? '🌱 Growing' : '🌰 Ready to plant'}
        </div>
      </div>
    );
  }

  if (variant === 'background') {
    return (
      <div
        className={cn(
          'absolute inset-0 pointer-events-none opacity-20',
          className
        )}
      >
        <div className='relative w-full h-full bg-gradient-to-b from-sky-50 to-green-50'>
          {gardenElements.map(renderGardenElement)}
          {renderWeatherEffect()}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div
      className={cn(
        'relative w-full bg-gradient-to-b from-sky-100 to-green-200 rounded-xl overflow-hidden',
        className
      )}
    >
      {/* Sky background */}
      <div className='absolute inset-0 bg-gradient-to-b from-blue-100 via-sky-50 to-green-100' />

      {/* Clouds */}
      <motion.div
        className='absolute top-4 left-10 text-white opacity-60'
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Cloud className='h-8 w-8' />
      </motion.div>

      {/* Ground */}
      <div className='absolute bottom-0 w-full h-20 bg-gradient-to-t from-green-300 via-green-200 to-transparent' />
      <div className='absolute bottom-0 w-full h-4 bg-green-400' />

      {/* Garden elements */}
      <div className='relative w-full h-full min-h-[300px]'>
        <AnimatePresence>
          {gardenElements.map(renderGardenElement)}
        </AnimatePresence>

        {/* Weather effects */}
        {renderWeatherEffect()}

        {/* Interactive Garden Enhancements */}
        {showInteractiveEnhancements && (
          <InteractiveGardenEnhancements
            showLeafMovement={animated && !shouldReduceMotion}
            leafCount={Math.min(
              gardenElements.filter(
                e => e.type === 'tree' || e.type === 'sprout'
              ).length * 4,
              16
            )}
            treeElements={gardenElements
              .filter(e => e.type === 'tree' || e.type === 'sprout')
              .map(e => ({ id: e.id, x: e.x, y: e.y }))}
            showSofiaFirefly={true}
            sofiaFireflyActive={interactive}
            showCelebrations={true}
            activeCelebrations={activeCelebrations}
            glowingElements={glowingElements}
            personalityMode={effectiveMode}
            containerWidth={400}
            containerHeight={300}
            reducedMotion={shouldReduceMotion}
            onFireflyClick={() => {
              onSofiaFireflyClick?.();
              // Optional: trigger a small celebration when Sofia is clicked
              if (interactive) {
                const clickCelebrationId = `sofia-click-${Date.now()}`;
                setActiveCelebrations(prev => [...prev, clickCelebrationId]);
                setTimeout(() => {
                  setActiveCelebrations(prev =>
                    prev.filter(id => id !== clickCelebrationId)
                  );
                }, 3000);
              }
            }}
            onCelebrationComplete={celebrationId => {
              setActiveCelebrations(prev =>
                prev.filter(id => id !== celebrationId)
              );
            }}
          />
        )}

        {/* Garden message */}
        <div className='absolute bottom-6 left-6 right-6'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg'
          >
            <h3 className='font-semibold text-green-800 mb-1'>
              Your Legacy Garden
            </h3>
            <p className='text-sm text-green-700 leading-relaxed'>
              {getGardenMessage()}
            </p>

            {gardenElements.length > 0 && (
              <div className='flex items-center gap-4 mt-3 text-xs text-green-600'>
                <span>🌱 {documentsCount} docs</span>
                <span>🌸 {familyMembersCount} family</span>
                <span>🦋 {emergencyContactsCount} contacts</span>
                {protectionDays > 0 && <span>📅 {protectionDays} days</span>}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
