
/**
 * Professional Review Badge Component
 * Shows professional review status with trust indicators
 */

import { AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProfessionalReview } from '@/types/will';

interface ProfessionalReviewBadgeProps {
  className?: string;
  review?: ProfessionalReview;
  showIcon?: boolean;
  size?: 'lg' | 'md' | 'sm';
}

export function ProfessionalReviewBadge({
  review,
  size = 'md',
  showIcon = true,
  className,
}: ProfessionalReviewBadgeProps) {
  if (!review) {
    return (
      <Badge
        variant='outline'
        className={cn(
          'border-accent/20 bg-accent/5 text-accent gap-1.5',
          size === 'sm' && 'px-2 py-0.5 text-xs',
          size === 'md' && 'px-2.5 py-1 text-sm',
          size === 'lg' && 'px-3 py-1.5 text-base',
          className
        )}
      >
        {showIcon && <AlertTriangle className='h-3 w-3' />}
        Not Reviewed
      </Badge>
    );
  }

  const getStatusConfig = (status: ProfessionalReview['status']) => {
    switch (status) {
      case 'approved':
        return {
          label: 'Professionally Reviewed',
          icon: CheckCircle,
          className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        };
      case 'in_review':
        return {
          label: 'Under Review',
          icon: Clock,
          className: 'border-blue-200 bg-blue-50 text-blue-800',
        };
      case 'needs_revision':
        return {
          label: 'Needs Revision',
          icon: AlertTriangle,
          className: 'border-yellow-200 bg-yellow-50 text-yellow-800',
        };
      case 'pending':
        return {
          label: 'Review Pending',
          icon: Clock,
          className: 'border-gray-200 bg-gray-50 text-gray-800',
        };
      case 'rejected':
        return {
          label: 'Review Issues',
          icon: AlertTriangle,
          className: 'border-red-200 bg-red-50 text-red-800',
        };
      default:
        return {
          label: 'Unknown Status',
          icon: AlertTriangle,
          className: 'border-gray-200 bg-gray-50 text-gray-800',
        };
    }
  };

  const config = getStatusConfig(review.status);
  const IconComponent = config.icon;

  return (
    <Badge
      variant='outline'
      className={cn(
        config.className,
        'gap-1.5 font-medium',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        size === 'lg' && 'px-3 py-1.5 text-base',
        className
      )}
    >
      {showIcon && <IconComponent className='h-3 w-3' />}
      {review.certification_level === 'legal_certified' && (
        <Shield className='h-3 w-3 text-primary' />
      )}
    </Badge>
  );
}
