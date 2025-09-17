
/**
 * Trust Score Visualization Component
 * Shows family protection level with animated progress ring
 */

import { useEffect, useState } from 'react';
import { Award, FileCheck, Shield, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getFamilyImpactMessage,
  getFamilyProtectionLevel,
  getTrustScoreTheme,
} from '@/lib/trust-score';
import type { TrustScore } from '@/types/will';

interface TrustScoreVisualizationProps {
  className?: string;
  familyMembersCount?: number;
  showDetails?: boolean;
  trustScore: TrustScore;
  variant?: 'compact' | 'full' | 'minimal';
}

export function TrustScoreVisualization({
  trustScore,
  familyMembersCount = 0,
  variant = 'full',
  showDetails = true,
  className,
}: TrustScoreVisualizationProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const theme = getTrustScoreTheme(trustScore.overall_score);
  const protectionLevel = getFamilyProtectionLevel(trustScore.overall_score);
  const impactMessage = getFamilyImpactMessage(
    trustScore.overall_score,
    familyMembersCount
  );

  // Animate score on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(trustScore.overall_score);
    }, 100);
    return () => clearTimeout(timer);
  }, [trustScore.overall_score]);

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className='relative h-8 w-8'>
          <svg className='h-8 w-8 -rotate-90 transform'>
            <circle
              cx='16'
              cy='16'
              r='12'
              stroke='currentColor'
              strokeWidth='3'
              fill='transparent'
              className='text-gray-200'
            />
            <circle
              cx='16'
              cy='16'
              r='12'
              stroke='currentColor'
              strokeWidth='3'
              fill='transparent'
              strokeDasharray={2 * Math.PI * 12}
              strokeDashoffset={
                2 * Math.PI * 12 - (animatedScore / 100) * (2 * Math.PI * 12)
              }
              className={cn(
                'transition-all duration-1000 ease-out',
                theme.color === 'emerald' && 'text-emerald-500',
                theme.color === 'green' && 'text-green-500',
                theme.color === 'yellow' && 'text-yellow-500',
                theme.color === 'orange' && 'text-orange-500'
              )}
            />
          </svg>
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className={cn('text-xs font-semibold', theme.text)}>
              {animatedScore}
            </span>
          </div>
        </div>
        <div className='flex flex-col'>
          <span className='text-sm font-medium capitalize'>
            {protectionLevel}
          </span>
          <span className='text-xs text-muted-foreground'>Protection</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg',
          theme.bg,
          theme.border,
          'border',
          className
        )}
      >
        <div className='relative h-12 w-12'>
          <svg className='h-12 w-12 -rotate-90 transform'>
            <circle
              cx='24'
              cy='24'
              r='18'
              stroke='currentColor'
              strokeWidth='3'
              fill='transparent'
              className='text-gray-200'
            />
            <circle
              cx='24'
              cy='24'
              r='18'
              stroke='currentColor'
              strokeWidth='3'
              fill='transparent'
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={
                2 * Math.PI * 18 - (animatedScore / 100) * (2 * Math.PI * 18)
              }
              className={cn(
                'transition-all duration-1000 ease-out',
                theme.color === 'emerald' && 'text-emerald-500',
                theme.color === 'green' && 'text-green-500',
                theme.color === 'yellow' && 'text-yellow-500',
                theme.color === 'orange' && 'text-orange-500'
              )}
            />
          </svg>
          <div className='absolute inset-0 flex items-center justify-center'>
            <Shield className={cn('h-5 w-5', theme.text)} />
          </div>
        </div>
        <div className='flex-1'>
          <div className='flex items-center gap-2'>
            <span className={cn('text-lg font-bold', theme.text)}>
              {animatedScore}
            </span>
            <span className='text-sm text-muted-foreground'>/ 100</span>
          </div>
          <p className='text-sm capitalize font-medium'>
            {protectionLevel} Protection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Score Display */}
      <div className={cn('p-6 rounded-lg', theme.bg, theme.border, 'border')}>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <h3 className='text-lg font-semibold'>Family Protection Score</h3>
            <p className='text-sm text-muted-foreground'>{impactMessage}</p>
          </div>
          <div className='relative h-20 w-20'>
            <svg className='h-20 w-20 -rotate-90 transform'>
              {/* Background circle */}
              <circle
                cx='40'
                cy='40'
                r='35'
                stroke='currentColor'
                strokeWidth='6'
                fill='transparent'
                className='text-gray-200'
              />
              {/* Progress circle */}
              <circle
                cx='40'
                cy='40'
                r='35'
                stroke='currentColor'
                strokeWidth='6'
                fill='transparent'
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={cn(
                  'transition-all duration-1000 ease-out',
                  theme.color === 'emerald' && 'text-emerald-500',
                  theme.color === 'green' && 'text-green-500',
                  theme.color === 'yellow' && 'text-yellow-500',
                  theme.color === 'orange' && 'text-orange-500'
                )}
                strokeLinecap='round'
              />
            </svg>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-center'>
                <div className={cn('text-xl font-bold', theme.text)}>
                  {animatedScore}
                </div>
                <div className='text-xs text-muted-foreground'>/ 100</div>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-4 flex items-center justify-between text-sm'>
          <span className='capitalize font-medium'>
            {protectionLevel} Protection
          </span>
          <div className='flex items-center gap-1 text-muted-foreground'>
            <TrendingUp className='h-3 w-3' />
            <span>
              Updated {new Date(trustScore.last_updated).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className='grid gap-3'>
          <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
            <div className='flex items-center gap-2'>
              <FileCheck className='h-4 w-4 text-blue-600' />
              <span className='text-sm font-medium'>Document Completeness</span>
            </div>
            <span className='text-sm font-semibold'>
              {trustScore.completeness_score}/100
            </span>
          </div>

          <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
            <div className='flex items-center gap-2'>
              <Shield className='h-4 w-4 text-green-600' />
              <span className='text-sm font-medium'>Legal Validation</span>
            </div>
            <span className='text-sm font-semibold'>
              {trustScore.validation_score}/100
            </span>
          </div>

          <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
            <div className='flex items-center gap-2'>
              <Award className='h-4 w-4 text-purple-600' />
              <span className='text-sm font-medium'>Professional Review</span>
            </div>
            <span className='text-sm font-semibold'>
              {trustScore.professional_score}/100
            </span>
          </div>

          <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-orange-600' />
              <span className='text-sm font-medium'>
                Family Protection Setup
              </span>
            </div>
            <span className='text-sm font-semibold'>
              {trustScore.family_protection_score}/100
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
