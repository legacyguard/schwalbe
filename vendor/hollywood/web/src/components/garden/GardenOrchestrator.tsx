
// Garden Orchestrator - Central management system for legacy garden components
// Coordinates all garden elements with Sofia's personality system

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePersonalityManager } from '@/components/sofia/SofiaContextProvider';
import { AnimationSystem } from '@/lib/animation-system';
import type { PersonalityMode } from '@/lib/sofia-types';
import { useGardenProgress } from '@/hooks/useGardenProgress';

// Import garden components
import { LegacyGardenVisualization } from './LegacyGardenVisualization';
import { AdaptiveLegacyTree } from './AdaptiveLegacyTree';
import { GardenSeed } from '@/components/animations/GardenSeed';

// Icons
import {
  Crown,
  Eye,
  EyeOff,
  Flower,
  Heart,
  Shield,
  Sprout,
  Target,
  TreePine,
} from 'lucide-react';

interface GardenView {
  component: 'detailed' | 'overview' | 'seed' | 'tree';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  name: string;
  personalityMatch: PersonalityMode[];
}

interface GardenOrchestratorProps {
  allowViewSwitching?: boolean;
  className?: string;
  // Display options
  defaultView?: string;
  enableCelebrations?: boolean;

  // Interaction options
  interactive?: boolean;
  // Event handlers
  onMilestoneClick?: (milestone: string) => void;

  onViewChange?: (view: string) => void;
  personalityMode?: PersonalityMode;
  showControls?: boolean;

  showTooltips?: boolean;
  // Layout options
  size?: 'compact' | 'fullscreen' | 'large' | 'medium';

  variant?: 'minimal' | 'premium' | 'standard';
}

export const GardenOrchestrator: React.FC<GardenOrchestratorProps> = ({
  defaultView = 'auto',
  personalityMode,
  allowViewSwitching = true,
  showControls = true,
  size = 'medium',
  variant = 'standard',
  interactive = true,
  showTooltips = true,
  enableCelebrations = true,
  onMilestoneClick,
  onViewChange,
  className = '',
}) => {
  const personalityManager = usePersonalityManager();
  const { progress, loading, error } = useGardenProgress();

  // Get effective personality mode
  const detectedMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const effectiveMode =
    personalityMode ||
    (detectedMode === 'balanced' ? 'adaptive' : detectedMode);

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();
  const animConfig = AnimationSystem.getConfig(effectiveMode);

  // State
  const [currentView, setCurrentView] = useState<string>('auto');
  const [showControls_, setShowControls] = useState(showControls);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastCelebration, setLastCelebration] = useState<null | string>(null);

  // Available garden views
  const gardenViews: GardenView[] = [
    {
      id: 'overview',
      name: 'Garden Overview',
      component: 'overview',
      icon: Flower,
      description: 'Complete garden with weather and elements',
      personalityMatch: ['empathetic', 'adaptive'],
    },
    {
      id: 'tree',
      name: 'Legacy Tree',
      component: 'tree',
      icon: TreePine,
      description: 'Focused tree growth visualization',
      personalityMatch: ['pragmatic', 'adaptive'],
    },
    {
      id: 'seed',
      name: 'Growth Seed',
      component: 'seed',
      icon: Sprout,
      description: 'Minimalist progress indicator',
      personalityMatch: ['pragmatic'],
    },
    {
      id: 'detailed',
      name: 'Detailed Garden',
      component: 'detailed',
      icon: Crown,
      description: 'Premium detailed visualization',
      personalityMatch: ['empathetic'],
    },
  ];

  // Auto-select view based on personality and progress
  useEffect(() => {
    if (currentView === 'auto' || defaultView === 'auto') {
      let selectedView = 'overview'; // default fallback

      if (effectiveMode === 'empathetic') {
        selectedView =
          progress && progress.overallProgress > 30 ? 'detailed' : 'overview';
      } else if (effectiveMode === 'pragmatic') {
        selectedView =
          progress && progress.overallProgress > 0 ? 'tree' : 'seed';
      } else {
        // Adaptive mode - choose based on progress
        if (progress) {
          if (progress.overallProgress < 10) selectedView = 'seed';
          else if (progress.overallProgress < 40) selectedView = 'tree';
          else selectedView = 'overview';
        }
      }

      setCurrentView(selectedView);
    }
  }, [effectiveMode, progress, currentView, defaultView]);

  // Handle view changes
  const handleViewChange = useCallback(
    async (viewId: string) => {
      if (viewId === currentView || isTransitioning) return;

      setIsTransitioning(true);

      // Personality-aware transition delay
      const transitionDelay =
        effectiveMode === 'empathetic'
          ? 300
          : effectiveMode === 'pragmatic'
            ? 100
            : 200;

      setTimeout(() => {
        setCurrentView(viewId);
        onViewChange?.(viewId);
        setIsTransitioning(false);
      }, transitionDelay);
    },
    [currentView, isTransitioning, effectiveMode, onViewChange]
  );

  // Handle milestone celebrations
  useEffect(() => {
    if (!progress) return;
    if (enableCelebrations && progress && progress.completedMilestones > 0) {
      const latestMilestone = `milestone-${progress.completedMilestones}`;
      if (
        latestMilestone !== lastCelebration &&
        progress.completedMilestones > 0
      ) {
        setLastCelebration(latestMilestone);
        // Could trigger celebration animation here
      }
    }
  }, [progress, lastCelebration, enableCelebrations]);

  // Get size configuration
  const getSizeConfig = () => {
    switch (size) {
      case 'compact':
        return { width: 'w-64', height: 'h-48', padding: 'p-2' };
      case 'medium':
        return { width: 'w-96', height: 'h-72', padding: 'p-4' };
      case 'large':
        return { width: 'w-[32rem]', height: 'h-96', padding: 'p-6' };
      case 'fullscreen':
        return { width: 'w-full', height: 'h-screen', padding: 'p-8' };
      default:
        return { width: 'w-96', height: 'h-72', padding: 'p-4' };
    }
  };

  const sizeConfig = getSizeConfig();

  // Render current garden view
  const renderGardenView = () => {
    if (!progress || loading) {
      return (
        <div className='flex items-center justify-center h-full'>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sprout className='w-8 h-8 text-green-500' />
          </motion.div>
        </div>
      );
    }

    if (error) {
      return (
        <div className='flex items-center justify-center h-full text-gray-500'>
          <div className='text-center'>
            <TreePine className='w-8 h-8 mx-auto mb-2 text-gray-400' />
            <p className='text-sm'>Garden data unavailable</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      documentsCount: progress.documentsCount,
      familyMembersCount: 0, // Would come from family members data
      guardiansCount: progress.guardiansCount,
      completedMilestones: progress.completedMilestones,
      totalMilestones: progress.totalMilestones,
      willProgress: progress.willProgress,
      timeCapsules: progress.timeCapsules,
      personalityMode: effectiveMode,
      interactive,
      showTooltips,
      onElementClick: (element: { milestone?: string }) => {
        if (element.milestone) {
          onMilestoneClick?.(element.milestone);
        }
      },
    };

    switch (currentView) {
      case 'overview':
        return (
          <LegacyGardenVisualization
            {...commonProps}
            emergencyContactsCount={0} // Would come from emergency contacts
            willCompleted={progress.willProgress > 80}
            trustScore={progress.overallProgress}
            protectionDays={30} // Would come from account age or similar
            achievedMilestones={progress.activeMilestones.map(m => m.id)}
            variant={size === 'compact' ? 'compact' : 'full'}
            animated={!shouldReduceMotion}
            showWeather={variant !== 'minimal'}
          />
        );

      case 'tree':
        return (
          <AdaptiveLegacyTree
            {...commonProps}
            size={
              size === 'compact'
                ? 'small'
                : size === 'large'
                  ? 'large'
                  : 'medium'
            }
            variant={variant === 'minimal' ? 'minimal' : 'detailed'}
            showProgress={variant !== 'minimal'}
          />
        );

      case 'seed':
        return (
          <div className='flex items-center justify-center h-full'>
            <GardenSeed
              progress={progress.overallProgress}
              size={
                size === 'compact'
                  ? 'small'
                  : size === 'large'
                    ? 'large'
                    : 'medium'
              }
              showPulse={!shouldReduceMotion}
              onSeedClick={() => onMilestoneClick?.('seed-growth')}
            />
          </div>
        );

      case 'detailed':
        // Enhanced detailed view with both tree and garden
        return (
          <div className='grid grid-cols-2 gap-4 h-full'>
            <AdaptiveLegacyTree
              {...commonProps}
              size='medium'
              variant='artistic'
              showProgress={false}
            />
            <LegacyGardenVisualization
              {...commonProps}
              emergencyContactsCount={0}
              willCompleted={progress.willProgress > 80}
              trustScore={progress.overallProgress}
              protectionDays={30}
              achievedMilestones={progress.activeMilestones.map(m => m.id)}
              variant='compact'
              animated={!shouldReduceMotion}
              showWeather={true}
            />
          </div>
        );

      default:
        return renderGardenView(); // Fallback to overview
    }
  };

  // Render view controls
  const renderControls = () => {
    if (!showControls_ || !allowViewSwitching) return null;

    return (
      <motion.div
        className='absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm'
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className='flex items-center gap-1'>
          {gardenViews
            .filter(
              view =>
                variant === 'premium' ||
                view.personalityMatch.includes(effectiveMode)
            )
            .map(view => {
              const Icon = view.icon;
              const isActive = currentView === view.id;

              return (
                <motion.button
                  key={view.id}
                  className={`p-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  onClick={() => handleViewChange(view.id)}
                  whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined}
                  whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}
                  title={view.description}
                  disabled={isTransitioning}
                >
                  <Icon className='w-4 h-4' />
                </motion.button>
              );
            })}

          <div className='w-px h-4 bg-gray-300 mx-1' />

          <motion.button
            className='p-2 rounded-md hover:bg-gray-100 text-gray-600'
            onClick={() => setShowControls(!showControls_)}
            whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined}
            whileTap={!shouldReduceMotion ? { scale: 0.95 } : undefined}
            title='Toggle controls'
          >
            {showControls_ ? (
              <EyeOff className='w-4 h-4' />
            ) : (
              <Eye className='w-4 h-4' />
            )}
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Get personality-themed container styling
  const getContainerStyling = () => {
    const base = 'relative rounded-xl overflow-hidden shadow-sm';

    switch (effectiveMode) {
      case 'empathetic':
        return `${base} bg-gradient-to-br from-green-50 to-emerald-50 border border-emerald-100`;
      case 'pragmatic':
        return `${base} bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100`;
      default:
        return `${base} bg-gradient-to-br from-green-50 to-purple-50 border border-purple-100`;
    }
  };

  return (
    <div
      className={`${sizeConfig.width} ${sizeConfig.height} ${sizeConfig.padding} ${getContainerStyling()} ${className}`}
    >
      {/* Main garden content */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentView}
          className='w-full h-full'
          initial={
            !shouldReduceMotion ? { opacity: 0, scale: 0.95 } : false
          }
          animate={!shouldReduceMotion ? { opacity: 1, scale: 1 } : false}
          exit={!shouldReduceMotion ? { opacity: 0, scale: 1.05 } : undefined}
          transition={
            !shouldReduceMotion
              ? {
                  duration: animConfig.duration,
                  ease: animConfig.ease as any,
                }
              : undefined
          }
        >
          {renderGardenView()}
        </motion.div>
      </AnimatePresence>

      {/* View controls */}
      {renderControls()}

      {/* Personality indicator */}
      {variant !== 'minimal' && (
        <motion.div
          className='absolute bottom-2 left-2 flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1'
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1 }}
        >
          {effectiveMode === 'empathetic' && (
            <Heart className='w-3 h-3 text-pink-400' />
          )}
          {effectiveMode === 'pragmatic' && (
            <Shield className='w-3 h-3 text-blue-500' />
          )}
          {effectiveMode === 'adaptive' && (
            <Target className='w-3 h-3 text-purple-500' />
          )}
          <span className='text-xs text-gray-600 font-medium capitalize'>
            {effectiveMode}
          </span>
        </motion.div>
      )}

      {/* Loading overlay */}
      {isTransitioning && (
        <motion.div
          className='absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <TreePine className='w-6 h-6 text-green-600' />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GardenOrchestrator;
