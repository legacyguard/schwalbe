
/**
 * Milestone Celebration Modal Component
 * Celebrates user achievements with family-focused emotional messaging
 */

import { useEffect, useState } from 'react';
import {
  Calendar,
  Crown,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import type { LegacyMilestone } from '@/lib/milestone-system';

interface MilestoneCelebrationModalProps {
  className?: string;
  isOpen: boolean;
  milestone: LegacyMilestone | null;
  onClose: () => void;
  onShareMilestone?: (milestone: LegacyMilestone) => void;
}

export function MilestoneCelebrationModal({
  milestone,
  isOpen,
  onClose,
  onShareMilestone,
  className,
}: MilestoneCelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<
    'celebrate' | 'enter' | 'settle'
  >('enter');

  useEffect(() => {
    if (isOpen && milestone) {
      // Trigger celebration animation sequence
      setTimeout(() => setAnimationPhase('celebrate'), 300);
      setTimeout(() => setAnimationPhase('settle'), 1500);

      if (milestone.celebration_data.animation === 'confetti') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } else {
      setAnimationPhase('enter');
      setShowConfetti(false);
    }
  }, [isOpen, milestone]);

  if (!milestone) return null;

  const getMilestoneIcon = (type: LegacyMilestone['type']) => {
    switch (type) {
      case 'first_document':
        return Sparkles;
      case 'family_protected':
        return Users;
      case 'will_complete':
        return Shield;
      case 'trust_score_milestone':
        return TrendingUp;
      case 'protection_level':
        return Crown;
      case 'time_milestone':
        return Calendar;
      default:
        return Sparkles;
    }
  };

  const getBadgeColor = (color: LegacyMilestone['badge_data']['color']) => {
    switch (color) {
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver':
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'bronze':
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white';
      case 'blue':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  const IconComponent = getMilestoneIcon(milestone.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-w-md p-0 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-0',
          className
        )}
      >
        <div className='relative'>
          {/* Confetti Effect */}
          <AnimatePresence>
            {showConfetti && (
              <div className='absolute inset-0 pointer-events-none z-50'>
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className='absolute w-2 h-2 bg-yellow-400 rounded-full'
                    initial={{ x: '50%', y: '50%', scale: 0, rotate: 0 }}
                    animate={{
                      x: Math.random() * 400 - 200,
                      y: Math.random() * 400 - 200,
                      scale: [0, 1, 0.5, 0],
                      rotate: 360,
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      ease: 'easeOut',
                    }}
                    style={{
                      backgroundColor: [
                        '#fbbf24',
                        '#f59e0b',
                        '#d97706',
                        '#92400e',
                      ][Math.floor(Math.random() * 4)],
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Close Button */}
          <Button
            variant='ghost'
            size='sm'
            onClick={onClose}
            className='absolute right-2 top-2 z-40 text-gray-600 hover:text-gray-800'
          >
            <X className='h-4 w-4' />
          </Button>

          {/* Header Section */}
          <motion.div
            className='text-center p-6 pb-4'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: animationPhase === 'celebrate' ? [1, 1.05, 1] : 1,
              opacity: 1,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Achievement Badge */}
            <motion.div
              className='inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 relative'
              animate={{
                rotate: animationPhase === 'celebrate' ? [0, 5, -5, 0] : 0,
                scale: animationPhase === 'celebrate' ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 0.8,
                repeat: animationPhase === 'celebrate' ? 2 : 0,
              }}
            >
              <div
                className={cn(
                  'absolute inset-0 rounded-full',
                  getBadgeColor(milestone.badge_data.color)
                )}
              />
              <IconComponent className='h-10 w-10 relative z-10' />

              {/* Glow effect for epic milestones */}
              {milestone.emotional_weight === 'epic' && (
                <motion.div
                  className='absolute inset-0 rounded-full bg-yellow-400 opacity-30'
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Achievement Title */}
            <motion.h2
              className='text-2xl font-bold text-gray-800 mb-2'
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {milestone.celebration_data.title}
            </motion.h2>

            {/* Emoji */}
            <motion.div
              className='text-3xl mb-3'
              animate={{
                scale: animationPhase === 'celebrate' ? [1, 1.2, 1] : 1,
                rotate: animationPhase === 'celebrate' ? [0, 10, -10, 0] : 0,
              }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {milestone.celebration_data.emoji}
            </motion.div>

            {/* Rarity Badge */}
            <Badge
              variant='outline'
              className={cn(
                'text-xs font-medium mb-4',
                milestone.badge_data.rarity === 'legendary' &&
                  'border-yellow-300 text-yellow-700 bg-yellow-50',
                milestone.badge_data.rarity === 'epic' &&
                  'border-purple-300 text-purple-700 bg-purple-50',
                milestone.badge_data.rarity === 'rare' &&
                  'border-blue-300 text-blue-700 bg-blue-50',
                milestone.badge_data.rarity === 'common' &&
                  'border-gray-300 text-gray-700 bg-gray-50'
              )}
            >
              {milestone.badge_data.rarity.toUpperCase()} ACHIEVEMENT
            </Badge>
          </motion.div>

          {/* Content Section */}
          <motion.div
            className='px-6 pb-6'
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {/* Main Message */}
            <div className='bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-4'>
              <p className='text-base text-gray-700 leading-relaxed text-center'>
                {milestone.celebration_data.message}
              </p>
            </div>

            {/* Family Impact Message */}
            <div className='bg-blue-50/70 backdrop-blur-sm rounded-lg p-4 mb-4'>
              <h4 className='font-medium text-blue-800 mb-2 text-center'>
                Family Impact
              </h4>
              <p className='text-sm text-blue-700 text-center leading-relaxed'>
                {milestone.family_impact_message}
              </p>
            </div>

            {/* Family Benefit Score */}
            <div className='flex items-center justify-center gap-2 mb-6'>
              <span className='text-sm text-gray-600'>
                Family Benefit Score:
              </span>
              <div className='flex items-center gap-1'>
                <div className='text-lg font-bold text-emerald-600'>
                  {milestone.family_benefit_score}
                </div>
                <div className='text-sm text-gray-500'>/100</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3 justify-center'>
              {onShareMilestone && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onShareMilestone(milestone)}
                  className='flex-1 max-w-32'
                >
                  Share
                </Button>
              )}
              <Button
                onClick={onClose}
                className='flex-1 max-w-32 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              >
                Continue
              </Button>
            </div>
          </motion.div>

          {/* Background Animation Elements */}
          <div className='absolute inset-0 pointer-events-none overflow-hidden'>
            {milestone.celebration_data.animation === 'firefly_trail' && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className='absolute w-1 h-1 bg-yellow-400 rounded-full opacity-60'
                    initial={{ x: 0, y: '100%' }}
                    animate={{
                      x: [0, 100, 200, 300, 400],
                      y: ['100%', '80%', '40%', '20%', '0%'],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.5,
                      repeat: animationPhase === 'celebrate' ? 1 : 0,
                    }}
                  />
                ))}
              </>
            )}

            {milestone.celebration_data.animation === 'garden_bloom' && (
              <motion.div
                className='absolute bottom-0 left-1/2 transform -translate-x-1/2'
                initial={{ scale: 0, y: 20 }}
                animate={{
                  scale: animationPhase === 'celebrate' ? [0, 1.2, 1] : 1,
                  y: animationPhase === 'celebrate' ? [20, -10, 0] : 0,
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <div className='text-4xl opacity-20'>🌱</div>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
