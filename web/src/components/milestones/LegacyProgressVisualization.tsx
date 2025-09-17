
/**
 * Legacy Progress Visualization Component
 * Shows family protection progress with emotional framing and garden growth metaphor
 */

import { useEffect, useState } from 'react';
import {
  ChevronRight,
  Clock,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  calculateFamilyProtectionDays,
  getMilestoneProgress,
  getNextMilestoneSuggestion,
  type MilestoneTriggerConditions,
} from '@/lib/milestone-system';

interface LegacyProgressVisualizationProps {
  achievedMilestones?: string[];
  className?: string;
  documents: any[];
  emergencyContactsCount?: number;
  familyMembersCount?: number;
  onNextAction?: (action: string) => void;
  showGardenGrowth?: boolean;
  trustScore?: number;
  variant?: 'compact' | 'full' | 'header';
  willData?: any;
}

export function LegacyProgressVisualization({
  documents = [],
  willData,
  familyMembersCount = 0,
  emergencyContactsCount = 0,
  trustScore = 0,
  achievedMilestones = [],
  onNextAction,
  variant = 'full',
  showGardenGrowth = true,
  className,
}: LegacyProgressVisualizationProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [gardenStage, setGardenStage] = useState<
    'blooming' | 'flourishing' | 'growing' | 'seed' | 'sprout'
  >('seed');

  // Build trigger conditions for milestone calculations
  const conditions: MilestoneTriggerConditions = {
    documentsCount: documents.length,
    familyMembersCount,
    emergencyContactsCount,
    willCompleted: !!willData?.beneficiaries?.length,
    trustScore,
    protectionLevel: getTrustScoreLevel(trustScore),
    daysSinceFirstDocument:
      documents.length > 0
        ? Math.floor(
            (Date.now() -
              new Date(documents[0]?.created_at || Date.now()).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0,
    hasInsurance: documents.some(d => d.category === 'insurance'),
    hasMedical: documents.some(d => d.category === 'medical'),
    hasLegal: documents.some(d => d.category === 'legal'),
    professionalReviewCompleted: trustScore >= 80,
  };

  const progress = getMilestoneProgress(conditions);
  const protectionDays = calculateFamilyProtectionDays(
    documents[0]?.created_at
  );
  const nextSuggestion = getNextMilestoneSuggestion(
    conditions,
    achievedMilestones
  );

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress.overall);
    }, 500);
    return () => clearTimeout(timer);
  }, [progress.overall]);

  // Update garden stage based on progress
  useEffect(() => {
    if (progress.overall >= 90) setGardenStage('flourishing');
    else if (progress.overall >= 70) setGardenStage('blooming');
    else if (progress.overall >= 40) setGardenStage('growing');
    else if (progress.overall >= 10) setGardenStage('sprout');
    else setGardenStage('seed');
  }, [progress.overall]);

  const getProgressMessage = (score: number, familyCount: number) => {
    const familyTerm =
      familyCount > 0 ? `${familyCount} family members` : 'your loved ones';

    if (score >= 90) {
      return `${familyTerm} enjoy comprehensive protection - your legacy garden is in full bloom! 🌸`;
    } else if (score >= 70) {
      return `${familyTerm} have strong protection - your legacy garden is blooming beautifully! 🌺`;
    } else if (score >= 40) {
      return `${familyTerm} have good protection - your legacy garden is growing strong! 🌱`;
    } else if (score >= 10) {
      return `${familyTerm} have basic protection - your legacy garden is starting to sprout! 🌿`;
    } else {
      return `Plant the first seed of protection for ${familyTerm} - start your legacy garden! 🌱`;
    }
  };

  const getGardenVisualization = (stage: typeof gardenStage) => {
    const stages = {
      seed: {
        emoji: '🌰',
        color: 'text-brown-600',
        description: 'Seeds planted',
      },
      sprout: {
        emoji: '🌱',
        color: 'text-green-400',
        description: 'First growth',
      },
      growing: {
        emoji: '🌿',
        color: 'text-green-500',
        description: 'Growing strong',
      },
      blooming: {
        emoji: '🌸',
        color: 'text-pink-500',
        description: 'Beautiful blooms',
      },
      flourishing: {
        emoji: '🌺',
        color: 'text-purple-500',
        description: 'Full flourish',
      },
    };

    return stages[stage];
  };

  if (variant === 'header') {
    return (
      <div
        className={cn(
          'flex items-center gap-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg',
          className
        )}
      >
        <div className='flex items-center gap-2'>
          <div className='text-2xl'>
            {getGardenVisualization(gardenStage).emoji}
          </div>
          <div>
            <div className='font-medium text-sm'>
              {progress.overall}% Protected
            </div>
            <div className='text-xs text-gray-600'>
              {protectionDays} days of protection
            </div>
          </div>
        </div>

        <div className='flex-1'>
          <Progress value={animatedProgress} className='h-2' />
        </div>

        {nextSuggestion && (
          <Button
            size='sm'
            variant='outline'
            onClick={() => onNextAction?.(nextSuggestion.suggestion)}
            className='text-xs'
          >
            Next: {nextSuggestion.milestone}
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('', className)}>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='font-semibold text-sm'>Legacy Progress</h3>
            <Badge variant='outline' className='text-xs'>
              {progress.overall}%
            </Badge>
          </div>

          <Progress value={animatedProgress} className='h-3 mb-3' />

          <p className='text-xs text-gray-600 mb-3 leading-relaxed'>
            {getProgressMessage(progress.overall, familyMembersCount)}
          </p>

          {nextSuggestion && (
            <Button
              size='sm'
              variant='ghost'
              onClick={() => onNextAction?.(nextSuggestion.suggestion)}
              className='w-full justify-between text-xs h-8'
            >
              <span>{nextSuggestion.milestone}</span>
              <ChevronRight className='h-3 w-3' />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant
  const garden = getGardenVisualization(gardenStage);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className='pb-4'>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='text-lg font-bold'>
              Your Legacy Garden
            </CardTitle>
            <p className='text-sm text-muted-foreground mt-1'>
              {getProgressMessage(progress.overall, familyMembersCount)}
            </p>
          </div>

          {showGardenGrowth && (
            <motion.div
              className='text-4xl'
              animate={{
                scale: gardenStage === 'flourishing' ? [1, 1.1, 1] : 1,
                rotate: gardenStage === 'flourishing' ? [0, 5, -5, 0] : 0,
              }}
              transition={{
                duration: 2,
                repeat: gardenStage === 'flourishing' ? Infinity : 0,
              }}
            >
              {garden.emoji}
            </motion.div>
          )}
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Main Progress Bar */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Family Protection Level</span>
            <span className='text-sm text-muted-foreground'>
              {progress.overall}%
            </span>
          </div>

          <Progress value={animatedProgress} className='h-4'>
            <div
              className='h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2'
              style={{ width: `${animatedProgress}}%` }}
            >
              {animatedProgress > 20 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Sparkles className='h-3 w-3 text-white' />
                </motion.div>
              )}
            </div>
          </Progress>

          <div className='text-center'>
            <p className='text-xs text-gray-600'>
              <span className={cn('font-medium', garden.color)}>
                {garden.description}
              </span>
              {' • '}
              Next milestone: {progress.nextMilestone}
            </p>
          </div>
        </div>

        {/* Protection Stats Grid */}
        <div className='grid grid-cols-3 gap-4 text-center'>
          <div className='space-y-1'>
            <div className='flex items-center justify-center gap-1'>
              <Shield className='h-4 w-4 text-blue-600' />
              <span className='text-lg font-bold'>{documents.length}</span>
            </div>
            <p className='text-xs text-gray-600'>Documents Protected</p>
          </div>

          <div className='space-y-1'>
            <div className='flex items-center justify-center gap-1'>
              <Users className='h-4 w-4 text-green-600' />
              <span className='text-lg font-bold'>
                {familyMembersCount + emergencyContactsCount}
              </span>
            </div>
            <p className='text-xs text-gray-600'>People Protected</p>
          </div>

          <div className='space-y-1'>
            <div className='flex items-center justify-center gap-1'>
              <Clock className='h-4 w-4 text-purple-600' />
              <span className='text-lg font-bold'>{protectionDays}</span>
            </div>
            <p className='text-xs text-gray-600'>Days Protected</p>
          </div>
        </div>

        {/* Trust Score Indicator */}
        {trustScore > 0 && (
          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium'>Trust Score</span>
              <div className='flex items-center gap-1'>
                <TrendingUp className='h-4 w-4 text-blue-600' />
                <span className='text-sm font-bold text-blue-700'>
                  {trustScore}/100
                </span>
              </div>
            </div>
            <Progress value={trustScore} className='h-2' />
          </div>
        )}

        {/* Next Action Suggestion */}
        {nextSuggestion && (
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <h4 className='font-medium text-yellow-800 mb-2'>
              Continue Growing Your Garden
            </h4>
            <p className='text-sm text-yellow-700 mb-3'>
              {nextSuggestion.suggestion}
            </p>
            <div className='flex items-center justify-between'>
              <div className='text-xs text-yellow-600'>
                <span>Impact: {nextSuggestion.impact}</span>
                <span className='mx-2'>•</span>
                <span>Time: {nextSuggestion.timeEstimate}</span>
              </div>
              <Button
                size='sm'
                onClick={() => onNextAction?.(nextSuggestion.suggestion)}
                className='bg-yellow-600 hover:bg-yellow-700 text-white'
              >
                {nextSuggestion.milestone}
              </Button>
            </div>
          </div>
        )}

        {/* Emotional Encouragement */}
        <div className='text-center py-2'>
          <p className='text-sm text-gray-600 italic'>
            "Every step you take makes your family more secure" 💝
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getTrustScoreLevel(
  score: number
): 'basic' | 'comprehensive' | 'premium' | 'standard' {
  if (score >= 90) return 'comprehensive';
  if (score >= 75) return 'premium';
  if (score >= 50) return 'standard';
  return 'basic';
}
