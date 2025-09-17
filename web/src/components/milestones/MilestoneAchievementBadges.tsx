
/**
 * Milestone Achievement Badges Component
 * Displays earned badges and achievement progress with family impact focus
 */

import React, { useState } from 'react';
import {
  Calendar,
  Crown,
  FileCheck,
  Info,
  Lock,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LegacyMilestone } from '@/lib/milestone-system';

interface MilestoneAchievementBadgesProps {
  achievedMilestones: LegacyMilestone[];
  className?: string;
  onBadgeClick?: (milestone: LegacyMilestone) => void;
  showUpcoming?: boolean;
  upcomingMilestones?: LegacyMilestone[];
  variant?: 'grid' | 'horizontal' | 'showcase';
}

interface BadgeDisplayData {
  achieved: boolean;
  glowColor: string;
  gradient: string;
  icon: React.ComponentType<any>;
  milestone: LegacyMilestone;
  rarity: 'common' | 'epic' | 'legendary' | 'rare';
}

export function MilestoneAchievementBadges({
  achievedMilestones = [],
  upcomingMilestones = [],
  variant = 'grid',
  showUpcoming = true,
  onBadgeClick,
  className,
}: MilestoneAchievementBadgesProps) {
  const [hoveredBadge, setHoveredBadge] = useState<null | string>(null);

  const getMilestoneIcon = (type: LegacyMilestone['type']) => {
    switch (type) {
      case 'first_document':
        return FileCheck;
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
      case 'document_milestone':
        return FileCheck;
      default:
        return Sparkles;
    }
  };

  const getBadgeGradient = (
    color: LegacyMilestone['badge_data']['color'],
    achieved: boolean
  ) => {
    if (!achieved) return 'bg-gray-200 text-gray-400';

    switch (color) {
      case 'gold':
        return 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-white shadow-yellow-200';
      case 'silver':
        return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-white shadow-gray-200';
      case 'bronze':
        return 'bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600 text-white shadow-orange-200';
      case 'emerald':
        return 'bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-600 text-white shadow-emerald-200';
      case 'blue':
        return 'bg-gradient-to-br from-blue-300 via-blue-400 to-blue-600 text-white shadow-blue-200';
      default:
        return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-white shadow-gray-200';
    }
  };

  const getRarityEffects = (
    rarity: LegacyMilestone['badge_data']['rarity']
  ) => {
    switch (rarity) {
      case 'legendary':
        return {
          shadowClass: 'shadow-2xl shadow-yellow-300/50',
          glowClass: 'ring-4 ring-yellow-300/30',
          sparkleCount: 8,
        };
      case 'epic':
        return {
          shadowClass: 'shadow-xl shadow-purple-300/40',
          glowClass: 'ring-2 ring-purple-300/30',
          sparkleCount: 5,
        };
      case 'rare':
        return {
          shadowClass: 'shadow-lg shadow-blue-300/30',
          glowClass: 'ring-1 ring-blue-300/30',
          sparkleCount: 3,
        };
      case 'common':
        return {
          shadowClass: 'shadow-md',
          glowClass: '',
          sparkleCount: 0,
        };
      default:
        return {
          shadowClass: 'shadow-md',
          glowClass: '',
          sparkleCount: 0,
        };
    }
  };

  const prepareBadgeData = (): BadgeDisplayData[] => {
    const allMilestones = [
      ...achievedMilestones.map(m => ({ milestone: m, achieved: true })),
      ...(showUpcoming
        ? upcomingMilestones.map(m => ({ milestone: m, achieved: false }))
        : []),
    ];

    return allMilestones.map(({ milestone, achieved }) => ({
      milestone,
      achieved,
      icon: getMilestoneIcon(milestone.type),
      gradient: getBadgeGradient(milestone.badge_data.color, achieved),
      glowColor: milestone.badge_data.color,
      rarity: milestone.badge_data.rarity,
    }));
  };

  const badgeData = prepareBadgeData();

  const renderBadge = (data: BadgeDisplayData, index: number) => {
    const IconComponent = data.icon;
    const rarityEffects = getRarityEffects(data.rarity);
    const isHovered = hoveredBadge === data.milestone.id;

    return (
      <TooltipProvider key={data.milestone.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={cn(
                'relative cursor-pointer transition-all duration-300',
                data.achieved && rarityEffects.shadowClass,
                data.achieved && rarityEffects.glowClass,
                isHovered && 'scale-110'
              )}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.1 }}
              onHoverStart={() => setHoveredBadge(data.milestone.id)}
              onHoverEnd={() => setHoveredBadge(null)}
              onClick={() => data.achieved && onBadgeClick?.(data.milestone)}
            >
              {/* Badge Base */}
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300',
                  data.gradient,
                  !data.achieved && 'opacity-40'
                )}
              >
                {/* Icon */}
                <IconComponent className='h-8 w-8 relative z-10' />

                {/* Lock overlay for unachieved badges */}
                {!data.achieved && (
                  <div className='absolute inset-0 bg-black/20 flex items-center justify-center'>
                    <Lock className='h-5 w-5 text-gray-600' />
                  </div>
                )}

                {/* Sparkle effects for high rarity achieved badges */}
                {data.achieved && rarityEffects.sparkleCount > 0 && (
                  <>
                    {Array.from({ length: rarityEffects.sparkleCount }).map(
                      (_, i) => (
                        <motion.div
                          key={i}
                          className='absolute w-1 h-1 bg-white rounded-full'
                          style={{
                            top: `${20 + Math.sin(i * (360 / rarityEffects.sparkleCount) * (Math.PI / 180)) * 25}}%`,
                            left: `${50 + Math.cos(i * (360 / rarityEffects.sparkleCount) * (Math.PI / 180)) * 30}%`,
                          }}
                          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        />
                      )
                    )}
                  </>
                )}

                {/* Pulsing glow for legendary badges */}
                {data.achieved && data.rarity === 'legendary' && (
                  <motion.div
                    className='absolute inset-0 rounded-full bg-yellow-300/20'
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Rarity indicator */}
              <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2'>
                <Badge
                  variant='outline'
                  className={cn(
                    'text-xs px-1 py-0 h-4',
                    data.rarity === 'legendary' &&
                      'border-yellow-400 text-yellow-600 bg-yellow-50',
                    data.rarity === 'epic' &&
                      'border-purple-400 text-purple-600 bg-purple-50',
                    data.rarity === 'rare' &&
                      'border-blue-400 text-blue-600 bg-blue-50',
                    data.rarity === 'common' &&
                      'border-gray-400 text-gray-600 bg-gray-50',
                    !data.achieved && 'opacity-50'
                  )}
                >
                  {data.rarity.charAt(0).toUpperCase()}
                </Badge>
              </div>

              {/* Achievement date for achieved badges */}
              {data.achieved && (
                <div className='absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap'>
                  {new Date(
                    data.milestone.achievement_date
                  ).toLocaleDateString()}
                </div>
              )}
            </motion.div>
          </TooltipTrigger>

          <TooltipContent side='bottom' className='max-w-64'>
            <div className='p-2'>
              <div className='flex items-center gap-2 mb-1'>
                <h4 className='font-semibold text-sm'>
                  {data.milestone.title}
                </h4>
                {!data.achieved && <Lock className='h-3 w-3 text-gray-500' />}
              </div>
              <p className='text-xs text-gray-600 mb-2'>
                {data.milestone.description}
              </p>
              {data.achieved && (
                <div className='text-xs text-green-600 font-medium'>
                  Family Benefit: {data.milestone.family_benefit_score}/100
                </div>
              )}
              {!data.achieved && (
                <div className='text-xs text-gray-500'>
                  Complete more actions to unlock this achievement
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (variant === 'horizontal') {
    return (
      <div className={cn('flex gap-4 overflow-x-auto pb-2', className)}>
        {badgeData.map((data, index) => (
          <div key={data.milestone.id} className='flex-shrink-0'>
            {renderBadge(data, index)}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'showcase') {
    const featuredBadges = badgeData
      .filter(d => d.achieved && d.rarity !== 'common')
      .slice(0, 3);

    return (
      <Card className={cn('', className)}>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Crown className='h-5 w-5 text-yellow-600' />
            Achievement Showcase
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featuredBadges.length > 0 ? (
            <div className='flex justify-center gap-6'>
              {featuredBadges.map((data, index) => (
                <div key={data.milestone.id} className='text-center space-y-2'>
                  {renderBadge(data, index)}
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>
                      {data.milestone.title}
                    </p>
                    <p className='text-xs text-gray-600 max-w-24 mx-auto leading-tight'>
                      {data.milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-6 text-gray-500'>
              <Info className='h-12 w-12 mx-auto mb-3 text-gray-300' />
              <p className='text-sm'>
                Complete actions to earn your first badges!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default grid variant
  return (
    <div className={cn('', className)}>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold'>Achievement Badges</h3>
        <Badge variant='outline' className='text-xs'>
          {achievedMilestones.length} / {badgeData.length}
        </Badge>
      </div>

      <div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6'>
        {badgeData.map((data, index) => renderBadge(data, index))}
      </div>

      {achievedMilestones.length > 0 && (
        <div className='mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg'>
          <h4 className='font-medium text-blue-800 mb-2'>Your Family Impact</h4>
          <p className='text-sm text-blue-700'>
            Through these achievements, you've created{' '}
            <span className='font-semibold'>
              {Math.round(
                achievedMilestones.reduce(
                  (sum, m) => sum + m.family_benefit_score,
                  0
                ) / achievedMilestones.length
              )}
            </span>{' '}
            points of protection for your family. Every badge represents a step
            toward their security and peace of mind.
          </p>
        </div>
      )}
    </div>
  );
}
