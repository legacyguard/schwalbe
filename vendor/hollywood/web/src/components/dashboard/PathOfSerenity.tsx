
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { useAuth } from '@clerk/clerk-react';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import { GardenSeed } from '@/components/animations/GardenSeed';
import { useGardenProgress } from '@/hooks/useGardenProgress';
import { useFirefly } from '@/contexts/FireflyContext';
import {
  calculateUnlockedMilestones,
  type FiveMinuteChallenge,
  generateSerenityMessage,
  getNextChallenge,
  SERENITY_MILESTONES,
  type SerenityMilestone,
} from '@/lib/path-of-serenity';
import { showMilestoneRecognition } from './milestoneUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface PathOfSerenityProps {
  className?: string;
}

interface UserStats {
  categoriesWithDocuments: string[];
  documentsCount: number;
  guardiansCount: number;
  hasExpiryTracking: boolean;
  legacyItemsCount: number;
}

export const PathOfSerenity: React.FC<PathOfSerenityProps> = ({
  className = '',
}) => {
  const { t } = useTranslation('ui/path-of-serenity');
  const [milestones, setMilestones] =
    useState<SerenityMilestone[]>(SERENITY_MILESTONES);
  const [nextChallenge, setNextChallenge] =
    useState<FiveMinuteChallenge | null>(null);
  const [serenityMessage, setSerenityMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] =
    useState<null | SerenityMilestone>(null);
  const [_userStats, setUserStats] = useState<UserStats>({
    documentsCount: 0,
    guardiansCount: 0,
    categoriesWithDocuments: [],
    hasExpiryTracking: false,
    legacyItemsCount: 0,
  });
  // Track previous milestones to prevent duplicate celebrations
  const [previousMilestones, setPreviousMilestones] =
    useState<SerenityMilestone[]>(SERENITY_MILESTONES);

  // Garden progress integration
  const { progress: gardenProgress } = useGardenProgress();
  const { celebrate, guideToElement } = useFirefly();

  const { userId } = useAuth();
  const navigate = useNavigate();
  const createSupabaseClient = useSupabaseWithClerk();

  // Load user statistics
  useEffect(() => {
    const loadUserStats = async () => {
      if (!userId) return;

      try {
        const supabase = await createSupabaseClient();

        // Count documents
        const { data: documents } = await supabase
          .from('documents')
          .select('category, expires_at')
          .eq('user_id', userId);

        // Count guardians (simulated - we'll implement this when guardians feature is ready)
        const { data: guardians } = await supabase
          .from('guardians')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        const documentsCount = documents?.length || 0;
        const guardiansCount = guardians?.length || 0;
        const categoriesWithDocuments = [
          ...new Set(documents?.map(d => d.category).filter(Boolean) || []),
        ];
        const hasExpiryTracking = documents?.some(d => d.expires_at) || false;
        const legacyItemsCount = 0; // Will be implemented with legacy features

        const stats: UserStats = {
          documentsCount,
          guardiansCount,
          categoriesWithDocuments: categoriesWithDocuments.filter(
            Boolean
          ) as string[],
          hasExpiryTracking,
          legacyItemsCount,
        };

        setUserStats(stats);

        // Calculate unlocked milestones with celebration detection
        const result = calculateUnlockedMilestones(stats, previousMilestones);
        setMilestones(result.milestones);
        setPreviousMilestones(result.milestones);

        // Show elegant recognition for newly unlocked milestones
        if (result.newlyUnlocked.length > 0) {
          // Show recognition for the first newly unlocked milestone
          const milestoneToRecognize = result.newlyUnlocked[0];
          if (milestoneToRecognize) {
            showMilestoneRecognition(milestoneToRecognize, userId);
          }

          // Additional quiet notifications for multiple milestones
          if (result.newlyUnlocked.length > 1) {
            setTimeout(() => {
              toast.success(
                t('toast.milestonesUnlocked', { count: result.newlyUnlocked.length })
              );
            }, 1000);
          }
        }

        // Get next challenge
        const challenge = getNextChallenge(result.milestones, stats);
        setNextChallenge(challenge);

        // Generate serenity message
        const message = generateSerenityMessage(result.milestones);
        setSerenityMessage(message);
      } catch (error) {
        console.error(t('errors.loadingStats'), error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, createSupabaseClient]);

  const handleChallengeClick = () => {
    if (nextChallenge) {
      navigate(nextChallenge.navigationTarget);
      toast.success(t('challenge.startedToast'));
      celebrate('challenge_started');
    }
  };

  const handleMilestoneClick = (milestone: SerenityMilestone) => {
    setSelectedMilestone(milestone);
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className='flex items-center justify-center h-64'>
          <div className='flex items-center gap-3'>
            <Icon name='loader' className='w-6 h-6 animate-spin text-primary' />
            <span className='text-lg text-muted-foreground'>
              {t('loading')}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  const unlockedCount = milestones.filter(m => m.isUnlocked).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Garden Message */}
      <Card className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50'>
        <CardContent className='p-6'>
          <div className='text-center space-y-3'>
            <div className='flex items-center justify-center gap-2'>
              <Icon name='sparkles' className='w-6 h-6 text-green-600' />
              <h2 className='text-2xl font-bold text-green-900 dark:text-green-100'>
                {t('title')}
              </h2>
              <Icon name='sparkles' className='w-6 h-6 text-green-600' />
            </div>
            <p className='text-green-700 dark:text-green-200 text-lg leading-relaxed max-w-2xl mx-auto'>
              {serenityMessage}
            </p>
            {unlockedCount > 0 && (
              <div className='flex items-center justify-center gap-2 text-sm text-green-600'>
                <Icon name='checkCircle' className='w-4 h-4' />
                <span>
                  {t('milestones.achieved', { count: unlockedCount, total: milestones.length })}
                </span>
              </div>
            )}
            {gardenProgress && (
              <div className='flex justify-center mt-4'>
                <GardenSeed
                  progress={gardenProgress.overallProgress}
                  size='medium'
                  showPulse={true}
                  onSeedClick={() => guideToElement('garden-tree')}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* The Growing Garden Tree Visualization */}
      <Card className='overflow-hidden' id='garden-tree'>
        <CardContent className='p-0'>
          <div className='relative h-96 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-green-950 dark:via-emerald-950 dark:to-teal-900'>
            {/* Ground and sky background */}
            <div className='absolute inset-0'>
              <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-100 to-transparent dark:from-amber-900/30 dark:to-transparent'></div>
              <div className='absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent'></div>
            </div>

            {/* Floating particles/fireflies */}
            <div className='absolute inset-0 opacity-30'>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className='absolute w-2 h-2 bg-yellow-300 rounded-full'
                  style={{
                    left: `${20 + Math.random() * 60}}%`,
                    top: `${10 + Math.random() * 40}%`,
                  }}
                  animate={{
                    y: [-10, 10, -10],
                    x: [-5, 5, -5],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Main Tree Structure */}
            <svg
              className='absolute inset-0 w-full h-full'
              style={{ zIndex: 1 }}
            >
              <defs>
                <linearGradient
                  id='trunkGradient'
                  x1='0%'
                  y1='0%'
                  x2='100%'
                  y2='0%'
                >
                  <stop offset='0%' stopColor='#92400e' />
                  <stop offset='50%' stopColor='#a16207' />
                  <stop offset='100%' stopColor='#92400e' />
                </linearGradient>
                <radialGradient id='leavesGradient'>
                  <stop offset='0%' stopColor='#22c55e' />
                  <stop offset='70%' stopColor='#16a34a' />
                  <stop offset='100%' stopColor='#15803d' />
                </radialGradient>
              </defs>

              {/* Tree trunk */}
              <motion.rect
                x='48%'
                y='70%'
                width='4%'
                height={`${Math.min(30, 10 + unlockedCount * 4)}%`}
                fill='url(#trunkGradient)'
                rx='2'
                initial={{ height: '10%' }}
                animate={{
                  height: `${Math.min(30, 10 + unlockedCount * 4)}}%`,
                }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />

              {/* Tree branches - grow with progress */}
              {unlockedCount >= 2 && (
                <>
                  <motion.path
                    d='M 50% 75% Q 40% 65% 35% 55%'
                    fill='none'
                    stroke='url(#trunkGradient)'
                    strokeWidth='6'
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                  <motion.path
                    d='M 50% 75% Q 60% 65% 65% 55%'
                    fill='none'
                    stroke='url(#trunkGradient)'
                    strokeWidth='6'
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.7 }}
                  />
                </>
              )}

              {/* Tree canopy - grows with milestones */}
              {unlockedCount >= 1 && (
                <motion.ellipse
                  cx='50%'
                  cy='50%'
                  rx={`${Math.min(25, 8 + unlockedCount * 2)}%`}
                  ry={`${Math.min(20, 6 + unlockedCount * 1.5)}%`}
                  fill='url(#leavesGradient)'
                  opacity='0.8'
                  initial={{ rx: '5%', ry: '5%' }}
                  animate={{
                    rx: `${Math.min(25, 8 + unlockedCount * 2)}}%`,
                    ry: `${Math.min(20, 6 + unlockedCount * 1.5)}%`,
                  }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                />
              )}
            </svg>

            {/* Milestone Points */}
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                className='absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2'
                style={{
                  left: `${milestone.visualPosition.x}}%`,
                  top: `${milestone.visualPosition.y}%`,
                  zIndex: 10,
                }}
                onClick={() => handleMilestoneClick(milestone)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay: index * 0.2,
                  type: 'spring',
                  stiffness: 200,
                }}
              >
                <div
                  className={`
                  relative w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-lg transition-all duration-300
                  ${
                    milestone.isUnlocked
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 shadow-green-200'
                      : 'bg-gradient-to-br from-slate-200 to-slate-300 border-slate-300 shadow-slate-200'
                  }
                `}
                >
                  {milestone.isUnlocked ? (
                    <>
                      <Icon
                        name={milestone.icon as any}
                        className='w-7 h-7 text-white'
                      />
                      <motion.div
                        className='absolute -inset-1 rounded-full bg-green-300 opacity-30'
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.1, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </>
                  ) : (
                    <Icon name='locked' className='w-7 h-7 text-slate-500' />
                  )}
                </div>

                {/* Milestone Label */}
                <div
                  className={`
                  absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-medium text-center whitespace-nowrap
                  ${
                    milestone.isUnlocked
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }
                `}
                >
                  {milestone.name.replace(
                    /^[\u{1F5FF}\u{1F91D}\u{1F3DB}\u{23F0}\u{1F5FA}\u{1F4AB}\u{1F451}]\s/u,
                    ''
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 5-Minute Challenge Section */}
      {nextChallenge && (
        <Card className='border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20'>
          <CardContent className='p-6'>
            <div className='flex items-start gap-4'>
              <div className='flex-shrink-0'>
                <div className='w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center'>
                  <Icon name='clock' className='w-6 h-6 text-amber-600' />
                </div>
              </div>
              <div className='flex-grow space-y-3'>
                <div>
                  <h3 className='text-lg font-semibold text-amber-900 dark:text-amber-100'>
                    {t('challenge.title', { minutes: nextChallenge.estimatedTime })}
                  </h3>
                  <h4 className='text-xl font-bold text-amber-800 dark:text-amber-200 mt-1'>
                    {nextChallenge.title}
                  </h4>
                </div>
                <p className='text-amber-700 dark:text-amber-200 leading-relaxed'>
                  {nextChallenge.description}
                </p>
                <div className='flex items-center gap-3'>
                  <Button
                    onClick={handleChallengeClick}
                    className='bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-2 rounded-lg shadow-md'
                  >
                    <Icon name='arrowRight' className='w-4 h-4 mr-2' />
                    {t('challenge.startButton', { minutes: nextChallenge.estimatedTime })}
                  </Button>
                  <div className='text-xs text-amber-600 dark:text-amber-300 flex items-center gap-1'>
                    <Icon name='sparkles' className='w-3 h-3' />
                    {t('challenge.guidance')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestone Detail Modal */}
      <AnimatePresence>
        {selectedMilestone && (
          <motion.div
            className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMilestone(null)}
          >
            <motion.div
              className='bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-xl'
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className='text-center space-y-4'>
                <div
                  className={`
                  w-20 h-20 mx-auto rounded-full border-4 flex items-center justify-center
                  ${
                    selectedMilestone.isUnlocked
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300'
                      : 'bg-gradient-to-br from-slate-200 to-slate-300 border-slate-300'
                  }
                `}
                >
                  <Icon
                    name={
                      selectedMilestone.isUnlocked
                        ? (selectedMilestone.icon as never)
                        : 'locked'
                    }
                    className={`w-8 h-8 ${selectedMilestone.isUnlocked ? 'text-white' : 'text-slate-500'}`}
                  />
                </div>

                <div>
                  <h3 className='text-xl font-bold text-slate-900 dark:text-slate-100'>
                    {selectedMilestone.name}
                  </h3>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                      selectedMilestone.isUnlocked
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {selectedMilestone.isUnlocked
                      ? t('milestones.unlocked')
                      : t('milestones.awaitingUnlock')}
                  </div>
                </div>

                <p className='text-slate-600 dark:text-slate-300 leading-relaxed'>
                  {selectedMilestone.isUnlocked
                    ? selectedMilestone.completedDescription
                    : selectedMilestone.description}
                </p>

                {selectedMilestone.isUnlocked && selectedMilestone.rewards && (
                  <div className='bg-green-50 dark:bg-green-950/20 p-4 rounded-lg'>
                    <h4 className='font-semibold text-green-800 dark:text-green-200 mb-2'>
                      🎉 {selectedMilestone.rewards.title}
                    </h4>
                    <p className='text-sm text-green-700 dark:text-green-300'>
                      {selectedMilestone.rewards.description}
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => setSelectedMilestone(null)}
                  variant='outline'
                  className='mt-4'
                >
                  {t('modal.close')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
