
// Enhanced Garden Section - Dashboard integration component for legacy garden
// Phase 2B: Dashboard Integration - Smart garden display with personality adaptation

import React, { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePersonalityManager } from '@/components/sofia/SofiaContextProvider';
import { GardenOrchestrator, useGardenProgress } from '@/components/garden';
import { AnimationSystem } from '@/lib/animation-system';
import { showMilestoneRecognition } from '@/components/dashboard/milestoneUtils';
import type { PersonalityMode } from '@/lib/sofia-types';
import type { SerenityMilestone } from '@/lib/path-of-serenity';
import { useTranslation } from 'react-i18next';

// Icons
import {
  ExternalLink,
  Heart,
  Settings,
  Shield,
  Sparkles,
  Target,
  TreePine,
  TrendingUp,
} from 'lucide-react';

interface EnhancedGardenSectionProps {
  className?: string;
  personalityMode?: PersonalityMode;
  showHeader?: boolean;
  showProgress?: boolean;
  showQuickActions?: boolean;
  size?: 'compact' | 'large' | 'medium';
  variant?: 'minimal' | 'premium' | 'standard';
}

export const EnhancedGardenSection: React.FC<EnhancedGardenSectionProps> = ({
  showHeader = true,
  showProgress = true,
  showQuickActions = true,
  size = 'medium',
  variant = 'standard',
  personalityMode,
  className = '',
}) => {
  const { t } = useTranslation('ui/enhanced-garden-section');
  const navigate = useNavigate();
  const personalityManager = usePersonalityManager();
  const {
    progress: gardenProgress,
    loading: gardenLoading,
    error,
  } = useGardenProgress();

  // Get effective personality mode
  const detectedMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const effectiveMode =
    personalityMode ||
    (detectedMode === 'balanced' ? 'adaptive' : detectedMode);

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();
  const animConfig = AnimationSystem.getConfig(effectiveMode);

  // State
  const [showMilestoneDetails, setShowMilestoneDetails] = useState(false);
  const [lastViewedMilestone, setLastViewedMilestone] = useState<null | string>(
    null
  );

  // Handle milestone celebrations
  const handleMilestoneClick = useCallback(
    (milestone: string) => {
      setLastViewedMilestone(milestone);

      // Show personality-aware milestone celebration
      if (gardenProgress?.activeMilestones) {
        const milestoneData = gardenProgress.activeMilestones.find(
          m => m.id === milestone
        );
        if (milestoneData) {
          showMilestoneRecognition(
            milestoneData as SerenityMilestone,
            undefined,
            effectiveMode
          );
        }
      }

      // Navigate to detailed view after celebration
      setTimeout(() => {
        navigate('/legacy', { state: { milestone } });
      }, 1500);
    },
    [navigate, gardenProgress, effectiveMode]
  );

  // Handle view changes
  const handleViewChange = useCallback((view: string) => {
    // Garden view changed - could trigger analytics or state updates here
    void view; // Acknowledge parameter
  }, []);

  // Get personality-specific content
  const getPersonalityContent = () => {
    switch (effectiveMode) {
      case 'empathetic':
        return {
          title: t('personalities.empathetic.title'),
          subtitle: t('personalities.empathetic.subtitle'),
          icon: Heart,
          bgGradient: 'from-green-50 to-emerald-50',
          borderColor: 'border-emerald-200',
          accentColor: 'text-emerald-600',
          progressLabel: t('personalities.empathetic.progressLabel'),
        };
      case 'pragmatic':
        return {
          title: t('personalities.pragmatic.title'),
          subtitle: t('personalities.pragmatic.subtitle'),
          icon: Shield,
          bgGradient: 'from-blue-50 to-slate-50',
          borderColor: 'border-blue-200',
          accentColor: 'text-blue-600',
          progressLabel: t('personalities.pragmatic.progressLabel'),
        };
      default:
        return {
          title: t('personalities.default.title'),
          subtitle: t('personalities.default.subtitle'),
          icon: Sparkles,
          bgGradient: 'from-purple-50 to-pink-50',
          borderColor: 'border-purple-200',
          accentColor: 'text-purple-600',
          progressLabel: t('personalities.default.progressLabel'),
        };
    }
  };

  const personalityContent = getPersonalityContent();
  const IconComponent = personalityContent.icon;

  // Quick actions based on personality and progress
  const getQuickActions = () => {
    if (!gardenProgress) return [];

    const actions = [];

    if (gardenProgress.documentsCount < 5) {
      actions.push({
        label:
          effectiveMode === 'empathetic'
            ? t('actions.documents.empathetic.label')
            : t('actions.documents.default.label'),
        icon: TrendingUp,
        onClick: () => navigate('/vault'),
        color: 'text-blue-600',
        description:
          effectiveMode === 'empathetic'
            ? t('actions.documents.empathetic.description')
            : t('actions.documents.default.description'),
      });
    }

    if (gardenProgress.guardiansCount < 2) {
      actions.push({
        label:
          effectiveMode === 'empathetic'
            ? t('actions.guardians.empathetic.label')
            : t('actions.guardians.default.label'),
        icon: effectiveMode === 'empathetic' ? Heart : Shield,
        onClick: () => navigate('/guardians'),
        color:
          effectiveMode === 'empathetic' ? 'text-pink-500' : 'text-green-600',
        description:
          effectiveMode === 'empathetic'
            ? t('actions.guardians.empathetic.description')
            : t('actions.guardians.default.description'),
      });
    }

    if (gardenProgress.completedMilestones < 3) {
      actions.push({
        label: t('actions.milestones.label'),
        icon: Target,
        onClick: () => navigate('/legacy'),
        color: 'text-purple-600',
        description: t('actions.milestones.description'),
      });
    }

    actions.push({
      label: t('actions.settings.label'),
      icon: Settings,
      onClick: () => navigate('/settings'),
      color: 'text-gray-600',
      description: t('actions.settings.description'),
    });

    return actions.slice(0, 3); // Limit to 3 actions
  };

  const quickActions = getQuickActions();

  if (error) {
    return (
      <div
        className={`bg-card rounded-xl border border-card-border p-6 ${className}`}
      >
        <div className='text-center py-8'>
          <TreePine className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-600 mb-2'>
            {t('error.title')}
          </h3>
          <p className='text-sm text-muted-foreground'>
            {t('error.message')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`bg-gradient-to-br ${personalityContent.bgGradient} rounded-xl border ${personalityContent.borderColor} shadow-sm overflow-hidden ${className}`}
      {...(!shouldReduceMotion
        ? {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: {
              duration: animConfig.duration,
              ease: animConfig.ease as any,
            },
          }
        : {})}
    >
      {/* Header */}
      {showHeader && (
        <div className='p-6 pb-4'>
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-3'>
              <motion.div
                className={`p-2 rounded-lg bg-white/80 backdrop-blur-sm ${personalityContent.accentColor}`}
                {...(!shouldReduceMotion ? { whileHover: { scale: 1.05 } } : {})}
              >
                <IconComponent className='w-5 h-5' />
              </motion.div>

              <div>
                <h3 className='text-lg font-semibold text-card-foreground mb-1'>
                  {personalityContent.title}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {personalityContent.subtitle}
                </p>
              </div>
            </div>

            <motion.button
              onClick={() => navigate('/legacy')}
              className='flex items-center gap-1 text-xs px-3 py-1 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white/90 transition-colors'
              {...(!shouldReduceMotion
                ? {
                    whileHover: { scale: 1.05 },
                    whileTap: { scale: 0.95 },
                  }
                : {})}
            >
              {t('buttons.viewDetails')}
              <ExternalLink className='w-3 h-3' />
            </motion.button>
          </div>
        </div>
      )}

      {/* Progress Summary */}
      {showProgress && gardenProgress && (
        <div className='px-6 pb-4'>
          <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4'>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-sm font-medium text-gray-700'>
                {personalityContent.progressLabel}
              </span>
              <span className='text-sm font-bold text-gray-800'>
                {gardenProgress.overallProgress}%
              </span>
            </div>

            <div className='w-full bg-gray-200 rounded-full h-2 mb-3'>
              <motion.div
                className={`h-2 rounded-full ${
                  effectiveMode === 'empathetic'
                    ? 'bg-emerald-500'
                    : effectiveMode === 'pragmatic'
                      ? 'bg-blue-600'
                      : 'bg-purple-500'
                }`}
                {...(shouldReduceMotion
                  ? {
                      style: { width: `${gardenProgress.overallProgress}%` },
                    }
                  : {
                      initial: { width: 0 },
                      animate: { width: `${gardenProgress.overallProgress}%` },
                      transition: { duration: 1, delay: 0.5 },
                    })}
              />
            </div>

            <div className='grid grid-cols-3 gap-4 text-xs text-gray-600'>
              <div className='text-center'>
                <div className='font-semibold text-gray-800'>
                  {gardenProgress.documentsCount}
                </div>
                <div>{t('stats.documents')}</div>
              </div>
              <div className='text-center'>
                <div className='font-semibold text-gray-800'>
                  {gardenProgress.guardiansCount}
                </div>
                <div>{t('stats.guardians')}</div>
              </div>
              <div className='text-center'>
                <div className='font-semibold text-gray-800'>
                  {gardenProgress.completedMilestones}
                </div>
                <div>{t('stats.milestones')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Garden Visualization */}
      <div className='px-6 pb-4'>
        {!gardenLoading && gardenProgress ? (
          <GardenOrchestrator
            personalityMode={effectiveMode}
            size={size}
            variant={variant}
            allowViewSwitching={variant !== 'minimal'}
            showControls={variant === 'premium'}
            interactive={true}
            enableCelebrations={true}
            onMilestoneClick={handleMilestoneClick}
            onViewChange={handleViewChange}
            className='w-full'
          />
        ) : (
          <div className='flex items-center justify-center h-48 bg-white/40 backdrop-blur-sm rounded-lg'>
            <motion.div
              {...(!shouldReduceMotion
                ? {
                    animate: { rotate: 360 },
                    transition: { duration: 2, repeat: Infinity, ease: 'linear' },
                  }
                : {})}
            >
              <TreePine className='w-8 h-8 text-gray-500' />
            </motion.div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {showQuickActions && quickActions.length > 0 && (
        <div className='px-6 pb-6'>
          <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4'>
            <h4 className='text-sm font-medium text-gray-700 mb-3'>
              {effectiveMode === 'empathetic'
                ? t('personalities.empathetic.quickActionsTitle')
                : effectiveMode === 'pragmatic'
                  ? t('personalities.pragmatic.quickActionsTitle')
                  : t('personalities.default.quickActionsTitle')}
            </h4>

            <div className='space-y-2'>
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  onClick={action.onClick}
                  className='w-full flex items-center gap-3 p-3 bg-white/80 rounded-lg hover:bg-white/90 transition-colors text-left'
                  {...(!shouldReduceMotion
                    ? {
                        whileHover: { scale: 1.02, x: 4 },
                        whileTap: { scale: 0.98 },
                        initial: { opacity: 0, x: -10 },
                        animate: { opacity: 1, x: 0 },
                        transition: { delay: index * 0.1 + 0.3 },
                      }
                    : {})}
                >
                  <action.icon
                    className={`w-4 h-4 ${action.color} flex-shrink-0`}
                  />
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm font-medium text-gray-800'>
                      {action.label}
                    </div>
                    <div className='text-xs text-gray-600 truncate'>
                      {action.description}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Milestone Details Modal */}
      <AnimatePresence>
        {showMilestoneDetails && lastViewedMilestone && (
          <motion.div
            className='absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 rounded-xl'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMilestoneDetails(false)}
          >
            <motion.div
              className='bg-white rounded-lg p-6 max-w-sm w-full'
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className='text-center'>
                <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Sparkles className='w-6 h-6 text-green-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                  {t('modal.milestoneAchieved')}
                </h3>
                <p className='text-sm text-gray-600 mb-4'>
                  {lastViewedMilestone}
                </p>
                <button
                  onClick={() => {
                    setShowMilestoneDetails(false);
                    navigate('/legacy');
                  }}
                  className='w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors'
                >
                  {t('buttons.viewInLegacyGarden')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EnhancedGardenSection;
