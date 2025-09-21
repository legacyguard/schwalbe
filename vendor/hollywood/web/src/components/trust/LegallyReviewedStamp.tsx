
/**
 * Legally Reviewed Stamp Component
 * Shows official legal review completion stamp for documents
 */

import { Award, CheckCircle, Shield, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { ProfessionalReview } from '@/types/will';

interface LegallyReviewedStampProps {
  className?: string;
  review: ProfessionalReview;
  size?: 'lg' | 'md' | 'sm';
  variant?: 'badge' | 'stamp' | 'watermark';
}

export function LegallyReviewedStamp({
  review,
  variant = 'stamp',
  size = 'md',
  className,
}: LegallyReviewedStampProps) {
  const { t } = useTranslation('ui/legally-reviewed-stamp');

  if (review.status !== 'approved') {
    return null;
  }

  const getCertificationConfig = (
    level: ProfessionalReview['certification_level']
  ) => {
    switch (level) {
      case 'legal_certified':
        return {
          label: t('certification.legal_certified.label'),
          icon: Award,
          color: 'emerald',
          gradient: 'from-emerald-500 to-green-600',
          badge: t('certification.legal_certified.badge'),
        };
      case 'premium':
        return {
          label: t('certification.premium.label'),
          icon: Shield,
          color: 'blue',
          gradient: 'from-blue-500 to-indigo-600',
          badge: t('certification.premium.badge'),
        };
      case 'basic':
        return {
          label: t('certification.basic.label'),
          icon: CheckCircle,
          color: 'green',
          gradient: 'from-green-500 to-emerald-600',
          badge: t('certification.basic.badge'),
        };
      default:
        return {
          label: t('certification.default.label'),
          icon: CheckCircle,
          color: 'gray',
          gradient: 'from-gray-500 to-gray-600',
          badge: t('certification.default.badge'),
        };
    }
  };

  const config = getCertificationConfig(review.certification_level);
  const IconComponent = config.icon;

  if (variant === 'badge') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white font-semibold text-xs',
          `bg-gradient-to-r ${config.gradient}`,
          'shadow-lg shadow-black/20',
          size === 'sm' && 'px-2 py-0.5 text-xs',
          size === 'md' && 'px-3 py-1 text-sm',
          size === 'lg' && 'px-4 py-1.5 text-base',
          className
        )}
      >
        <IconComponent className='h-3 w-3' />
        {config.label}
        {review.certification_level === 'legal_certified' && (
          <Sparkles className='h-3 w-3 animate-pulse' />
        )}
      </div>
    );
  }

  if (variant === 'watermark') {
    return (
      <div
        className={cn(
          'absolute top-4 right-4 opacity-20 pointer-events-none',
          'rotate-12 transform',
          className
        )}
      >
        <div
          className={cn(
            'flex flex-col items-center justify-center p-4 rounded-full',
            `text-${config.color}-600 border-2 border-${config.color}-600`,
            size === 'sm' && 'p-2 text-xs',
            size === 'md' && 'p-4 text-sm',
            size === 'lg' && 'p-6 text-base'
          )}
        >
          <IconComponent
            className={cn(
              size === 'sm' && 'h-4 w-4',
              size === 'md' && 'h-6 w-6',
              size === 'lg' && 'h-8 w-8'
            )}
          />
          <span className='font-bold mt-1'>{t('watermark.text')}</span>
        </div>
      </div>
    );
  }

  // Default stamp variant
  return (
    <div
      className={cn(
        'relative inline-flex flex-col items-center justify-center p-4 rounded-lg',
        'bg-white border-2 border-dashed shadow-lg',
        `border-${config.color}-500 text-${config.color}-700`,
        'transform rotate-2',
        size === 'sm' && 'p-2',
        size === 'md' && 'p-4',
        size === 'lg' && 'p-6',
        className
      )}
    >
      {/* Official stamp design */}
      <div className='flex items-center gap-2 mb-2'>
        <IconComponent
          className={cn(
            size === 'sm' && 'h-4 w-4',
            size === 'md' && 'h-5 w-5',
            size === 'lg' && 'h-6 w-6'
          )}
        />
        <span
          className={cn(
            'font-bold uppercase tracking-wider',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          {config.label}
        </span>
        {review.certification_level === 'legal_certified' && (
          <Sparkles
            className={cn(
              'animate-pulse text-accent',
              size === 'sm' && 'h-3 w-3',
              size === 'md' && 'h-4 w-4',
              size === 'lg' && 'h-5 w-5'
            )}
          />
        )}
      </div>

      {/* Reviewer info */}
      <div className='text-center'>
        <p
          className={cn(
            'font-semibold',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          {review.reviewer.name}
        </p>
        <p
          className={cn(
            'text-muted-foreground',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-xs',
            size === 'lg' && 'text-sm'
          )}
        >
          {review.reviewer.credentials}
        </p>
        {review.reviewer.specializations &&
          review.reviewer.specializations.length > 0 && (
            <p
              className={cn(
                'text-muted-foreground capitalize',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-xs',
                size === 'lg' && 'text-sm'
              )}
            >
              {review.reviewer.specializations[0]}
            </p>
          )}
      </div>

      {/* Review date */}
      <div className='mt-2 pt-2 border-t border-dashed border-current'>
        <p
          className={cn(
            'text-center text-muted-foreground',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-xs',
            size === 'lg' && 'text-sm'
          )}
        >
          {review.review_date
            ? new Date(review.review_date).toLocaleDateString()
            : t('fallback.dateNotAvailable')}
        </p>
      </div>

      {/* Compliance scores */}
      {(review.legal_compliance_score >= 90 ||
        review.family_protection_score >= 90) && (
        <div className='absolute -top-2 -right-2'>
          <div
            className={cn(
              'flex items-center justify-center rounded-full text-white font-bold',
              `bg-gradient-to-br ${config.gradient}`,
              'shadow-lg',
              size === 'sm' && 'h-6 w-6 text-xs',
              size === 'md' && 'h-8 w-8 text-sm',
              size === 'lg' && 'h-10 w-10 text-base'
            )}
          >
            {Math.max(
              review.legal_compliance_score,
              review.family_protection_score
            )}
          </div>
        </div>
      )}
    </div>
  );
}
