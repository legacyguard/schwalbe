/**
 * Milestone Celebration Component
 * Handles milestone completion celebrations with family impact messaging
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@schwalbe/ui/components/Button';
import { Card } from '@schwalbe/ui/components/Card';
import { Badge } from '@schwalbe/ui/components/Badge';
import {
  ArrowRight,
  CheckCircle2,
  Gift,
  Heart,
  Share2,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import type { EnhancedMilestone } from '@schwalbe/shared/types/milestones';

interface MilestoneCelebrationProps {
  isOpen: boolean;
  levelUp?: boolean;
  milestone: EnhancedMilestone;
  onClose: () => void;
  onContinue?: (nextAction?: string, nextUrl?: string) => void;
  onShare?: (milestone: EnhancedMilestone) => void;
  userLevel?: any;
}

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  milestone,
  isOpen,
  onClose,
  onShare,
  onContinue,
  userLevel,
  levelUp,
}) => {
  const [celebrationStage, setCelebrationStage] = useState<
    'celebration' | 'impact' | 'rewards'
  >('celebration');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getCelebrationIcon = () => {
    const iconMap = {
      '🌱': <Sparkles className='w-12 h-12 text-emerald-500' />,
      '🛡️': <Shield className='w-12 h-12 text-blue-500' />,
      '👨‍👩‍👧‍👦': <Users className='w-12 h-12 text-pink-500' />,
      '🏆': <Trophy className='w-12 h-12 text-yellow-500' />,
      '⭐': <Star className='w-12 h-12 text-purple-500' />,
      '🏗️': <Sparkles className='w-12 h-12 text-blue-500' />,
      '📁': <Sparkles className='w-12 h-12 text-green-500' />,
      '📋': <Sparkles className='w-12 h-12 text-purple-500' />,
      '👑': <Trophy className='w-12 h-12 text-yellow-500' />,
      '📊': <Sparkles className='w-12 h-12 text-emerald-500' />,
      '📅': <Sparkles className='w-12 h-12 text-blue-500' />,
    };

    return (
      iconMap[
        milestone.celebration_data.emoji as keyof typeof iconMap
      ] || <Trophy className='w-12 h-12 text-yellow-500' />
    );
  };

  const getCelebrationColor = () => {
    const colorMap = {
      emerald: 'from-emerald-500 to-green-600',
      blue: 'from-blue-500 to-indigo-600',
      pink: 'from-pink-500 to-rose-600',
      yellow: 'from-yellow-400 to-orange-500',
      purple: 'from-purple-500 to-violet-600',
    };

    return colorMap.blue || 'from-blue-500 to-indigo-600';
  };

  const renderCelebrationStage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='text-center space-y-6'
    >
      {/* Celebration Animation */}
      <div className='relative'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center shadow-2xl ${getCelebrationColor()}`}
        >
          {getCelebrationIcon()}
        </motion.div>

        {showConfetti && (
          <div className='absolute inset-0 pointer-events-none'>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  y: 0,
                  x: 0,
                  rotate: 0,
                  scale: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-20, -100, -200],
                  x: [0, (Math.random() - 0.5) * 200],
                  rotate: [0, Math.random() * 360],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
                className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full ${
                  i % 3 === 0
                    ? 'bg-yellow-400'
                    : i % 3 === 1
                      ? 'bg-pink-400'
                      : 'bg-blue-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Level Up Banner */}
      {levelUp && userLevel && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className='bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white'
        >
          <div className='flex items-center justify-center space-x-2'>
            <Star className='w-5 h-5' />
            <span className='font-semibold'>Level Up!</span>
            <Star className='w-5 h-5' />
          </div>
          <p className='text-sm mt-1 opacity-90'>
            You are now a <strong>{userLevel.name}</strong>!
          </p>
        </motion.div>
      )}

      {/* Celebration Message */}
      <div className='space-y-3'>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className='text-2xl font-bold text-gray-900'
        >
          {milestone.title} Complete!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='text-lg text-gray-700'
        >
          {milestone.celebration_data.message}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='text-base text-gray-600 italic'
        >
          {milestone.family_impact_message}
        </motion.p>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col sm:flex-row gap-3 pt-4'>
        <Button
          onClick={() => setCelebrationStage('impact')}
          className='flex-1'
        >
          See Family Impact
          <ArrowRight className='w-4 h-4 ml-2' />
        </Button>

        {onShare && (
          <Button
            variant='outline'
            onClick={() => onShare(milestone)}
            className='flex-1'
          >
            <Share2 className='w-4 h-4 mr-2' />
            Share Achievement
          </Button>
        )}
      </div>
    </motion.div>
  );

  const renderImpactStage = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className='space-y-6'
    >
      <div className='text-center'>
        <h3 className='text-xl font-bold text-gray-900 mb-2'>Family Impact</h3>
        <p className='text-gray-600'>
          {milestone.family_impact_message ||
            'Your family is now better protected.'}
        </p>
      </div>

      {/* Family Impact Metrics */}
      {milestone.familyImpact && (
        <Card>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {milestone.familyImpact.affectedMembers.length > 0 && (
                <div className='text-center p-4 bg-blue-50 rounded-lg'>
                  <Users className='w-8 h-8 text-blue-600 mx-auto mb-2' />
                  <p className='font-semibold text-blue-900'>Family Members</p>
                  <p className='text-2xl font-bold text-blue-600'>
                    {milestone.familyImpact.affectedMembers.length}
                  </p>
                  <p className='text-sm text-blue-700'>Protected</p>
                </div>
              )}

              <div className='text-center p-4 bg-green-50 rounded-lg'>
                <Shield className='w-8 h-8 text-green-600 mx-auto mb-2' />
                <p className='font-semibold text-green-900'>Risk Reduction</p>
                <p className='text-2xl font-bold text-green-600'>
                  {milestone.familyImpact.riskReduction || 0}%
                </p>
                <p className='text-sm text-green-700'>Improvement</p>
              </div>
            </div>

            {milestone.familyImpact.emotionalBenefit && (
              <div className='mt-4 p-4 bg-pink-50 rounded-lg text-center'>
                <Heart className='w-6 h-6 text-pink-600 mx-auto mb-2' />
                <p className='text-pink-800 font-medium'>
                  {milestone.familyImpact.emotionalBenefit}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className='flex gap-3'>
        <Button
          variant='outline'
          onClick={() => setCelebrationStage('celebration')}
          className='flex-1'
        >
          Back
        </Button>

        <Button
          onClick={() => setCelebrationStage('rewards')}
          className='flex-1'
        >
          View Rewards
          <ArrowRight className='w-4 h-4 ml-2' />
        </Button>
      </div>
    </motion.div>
  );

  const renderRewardsStage = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className='space-y-6'
    >
      <div className='text-center'>
        <h3 className='text-xl font-bold text-gray-900 mb-2'>
          Rewards Unlocked
        </h3>
        <p className='text-gray-600'>
          Your dedication has earned you these benefits
        </p>
      </div>

      <div className='grid gap-4'>
        {/* Family Benefit Score */}
        <Card>
          <div className='p-4'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                <Shield className='w-5 h-5 text-green-600' />
              </div>
              <div className='flex-1'>
                <p className='font-semibold text-gray-900'>Family Benefit</p>
                <p className='text-sm text-gray-600'>
                  Enhanced family protection and peace of mind
                </p>
              </div>
              <Badge
                variant='outline'
                className='text-green-600 border-green-200'
              >
                {milestone.family_benefit_score}/100
              </Badge>
            </div>
          </div>
        </Card>

        {/* Emotional Weight */}
        <Card>
          <div className='p-4'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center'>
                <Heart className='w-5 h-5 text-purple-600' />
              </div>
              <div className='flex-1'>
                <p className='font-semibold text-gray-900'>Emotional Impact</p>
                <p className='text-sm text-gray-600'>
                  {milestone.emotional_weight} significance achievement
                </p>
              </div>
              <Badge
                variant='outline'
                className={`${
                  milestone.emotional_weight === 'epic'
                    ? 'text-purple-600 border-purple-200'
                    : milestone.emotional_weight === 'high'
                      ? 'text-blue-600 border-blue-200'
                      : 'text-gray-600 border-gray-200'
                }`}
              >
                {milestone.emotional_weight}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Badge Achievement */}
        <Card>
          <div className='p-4'>
            <div className='flex items-start space-x-3'>
              <div className='w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center'>
                <Trophy className='w-5 h-5 text-yellow-600' />
              </div>
              <div className='flex-1'>
                <p className='font-semibold text-gray-900'>Badge Earned</p>
                <div className='flex flex-wrap gap-1 mt-1'>
                  <Badge
                    variant='outline'
                    className={`text-xs ${
                      milestone.badge_data.rarity === 'legendary'
                        ? 'text-yellow-600 border-yellow-200'
                        : milestone.badge_data.rarity === 'epic'
                          ? 'text-purple-600 border-purple-200'
                          : milestone.badge_data.rarity === 'rare'
                            ? 'text-blue-600 border-blue-200'
                            : 'text-gray-600 border-gray-200'
                    }`}
                  >
                    {milestone.badge_data.rarity.toUpperCase()} BADGE
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Final Actions */}
      <div className='space-y-3'>
        {milestone.triggers_next_milestone && (
          <Button
            onClick={() =>
              onContinue?.(
                'Continue your journey',
                '/'
              )
            }
            className='w-full'
            size='lg'
          >
            Continue Legacy Journey
            <ArrowRight className='w-4 h-4 ml-2' />
          </Button>
        )}

        <Button variant='outline' onClick={onClose} className='w-full'>
          Continue
        </Button>
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <motion.div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Main celebration container */}
      <motion.div
        className='relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 overflow-hidden'
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.1, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Close Button */}
        <Button
          variant='ghost'
          size='sm'
          onClick={onClose}
          className='absolute right-2 top-2 z-40 text-gray-600 hover:text-gray-800'
        >
          <X className='h-4 w-4' />
        </Button>

        <AnimatePresence mode='wait'>
          {celebrationStage === 'celebration' && (
            <motion.div key='celebration'>
              {renderCelebrationStage()}
            </motion.div>
          )}
          {celebrationStage === 'impact' && (
            <motion.div key='impact'>{renderImpactStage()}</motion.div>
          )}
          {celebrationStage === 'rewards' && (
            <motion.div key='rewards'>{renderRewardsStage()}</motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Milestone progress indicator component
export const MilestoneProgress: React.FC<{
  className?: string;
  progress: number;
  showLabel?: boolean;
}> = ({ progress, className, showLabel = true }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className='flex justify-between text-sm text-gray-600'>
          <span>Legacy Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className='w-full bg-gray-200 rounded-full h-2'>
        <motion.div
          className='bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full'
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};