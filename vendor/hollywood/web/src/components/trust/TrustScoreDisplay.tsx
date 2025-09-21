
/**
 * Trust Score Display Component
 * Shows user's trust score with different variants for A/B testing
 */

import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle,
  Info,
  Lock,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useABTest } from '@/lib/ab-testing/ab-testing-system';
import { useTrustScoreTracking } from '@/hooks/useConversionTracking';
import { useTranslation } from 'react-i18next';

interface TrustScoreDisplayProps {
  className?: string;
  maxScore?: number;
  onImproveClick?: () => void;
  showBoosts?: boolean;
  showDetails?: boolean;
  trustScore: number;
  userId?: string;
}

interface TrustBoostSuggestion {
  action: string;
  boost: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  urgent?: boolean;
}

const getTrustBoostSuggestions = (t: (key: string, options?: any) => string): TrustBoostSuggestion[] => [
  {
    action: t('boosts.addEmergencyContacts.action'),
    boost: 10,
    description: t('boosts.addEmergencyContacts.description'),
    icon: Shield,
  },
  {
    action: t('boosts.professionalReview.action'),
    boost: 25,
    description: t('boosts.professionalReview.description'),
    icon: Award,
    urgent: true,
  },
  {
    action: t('boosts.uploadEstateDocuments.action'),
    boost: 15,
    description: t('boosts.uploadEstateDocuments.description'),
    icon: Lock,
  },
  {
    action: t('boosts.completeWillWizard.action'),
    boost: 20,
    description: t('boosts.completeWillWizard.description'),
    icon: CheckCircle,
    urgent: true,
  },
];

export function TrustScoreDisplay({
  trustScore,
  maxScore = 100,
  showDetails = false,
  showBoosts = false,
  onImproveClick,
  className,
  userId,
}: TrustScoreDisplayProps) {
  const { t } = useTranslation('ui/trust-score-display');
  const { variant, trackConversion, isVariant } = useABTest(
    'trust_score_display_v1',
    userId
  );
  const {
    trackTrustScoreViewed,
    trackTrustScoreClicked,
    trackTrustScoreTooltip,
  } = useTrustScoreTracking();
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Track view on mount
  useEffect(() => {
    if (!hasTrackedView) {
      trackTrustScoreViewed(trustScore, 'dashboard');
      setHasTrackedView(true);
    }
  }, [trustScore, trackTrustScoreViewed, hasTrackedView]);

  const handleClick = () => {
    trackTrustScoreClicked(trustScore, variant);
    trackConversion('trust_score_clicked', 1, { currentScore: trustScore });
    onImproveClick?.();
  };

  const handleTooltipOpen = () => {
    trackTrustScoreTooltip(trustScore);
    trackConversion('trust_score_tooltip', 1, { currentScore: trustScore });
  };

  const percentage = Math.min((trustScore / maxScore) * 100, 100);
  const trustLevel = getTrustLevel(percentage);
  const nextBoosts = getTrustBoostSuggestions(t).filter(_boost => percentage < 80);

  // Don't show trust score in control variant
  if (isVariant('control')) {
    return null;
  }

  // Progress Ring Variant
  if (isVariant('variant_a')) {
    return (
      <TooltipProvider>
        <Tooltip
          onOpenChange={open => {
            if (open) {
              handleTooltipOpen();
            }
          }}
        >
          <TooltipTrigger asChild>
            <motion.div
              className={cn('relative', className)}
              whileHover={{ scale: 1.05 }}
              onClick={handleClick}
            >
              <Card className='border-2 border-secondary bg-gradient-to-br from-accent/10 to-primary/10 cursor-pointer hover:shadow-md transition-all'>
                <CardContent className='p-6'>
                  <div className='flex items-center gap-4'>
                    <div className='relative'>
                      {/* Circular progress ring */}
                      <svg
                        className='w-16 h-16 transform -rotate-90'
                        viewBox='0 0 100 100'
                      >
                        <circle
                          cx='50'
                          cy='50'
                          r='45'
                          stroke='currentColor'
                          strokeWidth='8'
                          fill='none'
                          className='text-gray-200'
                        />
                        <circle
                          cx='50'
                          cy='50'
                          r='45'
                          stroke='currentColor'
                          strokeWidth='8'
                          fill='none'
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
                          className={cn(
                            'transition-all duration-1000 ease-out',
                            trustLevel.color
                          )}
                          strokeLinecap='round'
                        />
                      </svg>
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='text-center'>
                          <div className='text-xl font-bold text-gray-900'>
                            {trustScore}
                          </div>
                          <div className='text-xs text-gray-500'>Trust</div>
                        </div>
                      </div>
                    </div>

                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900 mb-1'>
                        Family Protection Score
                      </h3>
                      <p className='text-sm text-gray-600 mb-2'>
                        {trustLevel.message}
                      </p>
                      <Badge className={cn('text-xs', trustLevel.badgeClass)}>
                        {trustLevel.label}
                      </Badge>
                    </div>

                    <TrendingUp className='h-5 w-5 text-blue-600' />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div className='max-w-xs'>
              <p className='font-medium mb-2'>Your Family Protection Score</p>
              <p className='text-sm mb-2'>
                This score reflects how well your family is protected if
                something happens to you.
              </p>
              <p className='text-xs text-gray-500'>
                Click to see improvement suggestions
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Badge Display Variant (default/variant_b)
  return (
    <TooltipProvider>
      <Tooltip
        onOpenChange={open => {
          if (open) {
            handleTooltipOpen();
          }
        }}
      >
        <TooltipTrigger asChild>
          <motion.div
            className={cn('', className)}
            whileHover={{ scale: 1.02 }}
            onClick={handleClick}
          >
            <Card className='border-l-4 border-l-blue-600 bg-white hover:shadow-md transition-all cursor-pointer'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                  <Shield className='h-4 w-4 text-blue-600' />
                  Family Protection Score
                  <Info
                    className='h-3 w-3 text-gray-400'
                    onClick={e => {
                      e.stopPropagation();
                      handleTooltipOpen();
                    }}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='text-2xl font-bold text-gray-900'>
                    {trustScore}
                  </div>
                  <Badge
                    className={cn('text-xs font-medium', trustLevel.badgeClass)}
                  >
                    {trustLevel.label}
                  </Badge>
                </div>

                <Progress value={percentage} className='mb-3 h-2' />

                <p className='text-sm text-gray-600 mb-3'>
                  {trustLevel.message}
                </p>

                {showBoosts && nextBoosts.length > 0 && (
                  <div className='space-y-2'>
                    <p className='text-xs font-medium text-gray-700'>
                      Quick Improvements:
                    </p>
                    {nextBoosts.slice(0, 2).map((boost, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-2 text-xs'
                      >
                        <boost.icon className='h-3 w-3 text-blue-600' />
                        <span className='flex-1'>{boost.action}</span>
                        <Badge variant='outline' className='text-xs'>
                          +{boost.boost}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {showDetails && (
                  <Button
                    size='sm'
                    variant='outline'
                    className='w-full mt-3'
                    onClick={handleClick}
                  >
                    Improve Score
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className='max-w-xs'>
            <p className='font-medium mb-2'>Family Protection Score</p>
            <p className='text-sm mb-2'>
              Measures how prepared your family would be in an emergency. Higher
              scores mean better protection and peace of mind.
            </p>
            {nextBoosts.length > 0 && (
              <div className='pt-2 border-t'>
                <p className='text-xs font-medium text-gray-700 mb-1'>
                  Next: +{nextBoosts[0].boost} points
                </p>
                <p className='text-xs text-gray-600'>
                  {nextBoosts[0].description}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getTrustLevel(percentage: number) {
  if (percentage >= 90) {
    return {
      label: 'Excellent',
      message: 'Your family is exceptionally well protected',
      color: 'text-green-600',
      badgeClass: 'bg-green-100 text-green-800 border-green-200',
    };
  } else if (percentage >= 75) {
    return {
      label: 'Very Good',
      message: 'Strong protection with room for minor improvements',
      color: 'text-blue-600',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    };
  } else if (percentage >= 60) {
    return {
      label: 'Good',
      message: 'Solid foundation, consider adding professional review',
      color: 'text-indigo-600',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
  } else if (percentage >= 40) {
    return {
      label: 'Needs Attention',
      message: 'Important gaps in your family protection',
      color: 'text-yellow-600',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
  } else {
    return {
      label: 'Getting Started',
      message: "Great start! Let's build stronger protection together",
      color: 'text-orange-600',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    };
  }
}

// Compact version for dashboard header
export function TrustScoreBadge({
  trustScore,
  onClick,
  className,
  userId,
}: {
  className?: string;
  onClick?: () => void;
  trustScore: number;
  userId?: string;
}) {
  const { variant: _variant, isVariant } = useABTest(
    'trust_score_display_v1',
    userId
  );
  const { trackTrustScoreClicked } = useTrustScoreTracking();

  const handleClick = () => {
    if (onClick) {
      trackTrustScoreClicked(trustScore, 'badge');
      onClick();
    }
  };

  // Don't show in control variant
  if (isVariant('control')) {
    return null;
  }

  const percentage = Math.min(trustScore, 100);
  const trustLevel = getTrustLevel(percentage);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleClick}
            className={cn(
              'h-auto p-2 hover:bg-blue-50 transition-colors',
              className
            )}
          >
            <div className='flex items-center gap-2'>
              <div className='relative'>
                <Shield className={cn('h-4 w-4', trustLevel.color)} />
                <div className='absolute -top-1 -right-1 bg-white rounded-full text-xs font-bold text-gray-900 px-1'>
                  {trustScore}
                </div>
              </div>
              <span className='text-sm font-medium text-gray-700'>
                Protection Score
              </span>
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className='text-center'>
            <p className='font-medium'>
              Family Protection Score: {trustScore}/100
            </p>
            <p className='text-sm text-gray-600'>{trustLevel.message}</p>
            <p className='text-xs text-gray-500 mt-1'>Click to improve</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
