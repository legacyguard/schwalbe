
/**
 * Review Completion Notification System
 * Handles notifications when professional reviews are completed
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle,
  FileText,
  Star,
  ThumbsUp,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type {
  DocumentReview,
  ProfessionalReviewer,
  ReviewResult,
} from '@/types/professional';

interface ReviewCompletionNotifierProps {
  className?: string;
  onDismiss?: () => void;
  onRateReview?: (rating: number, feedback: string) => void;
  onViewReport: () => void;
  result: ReviewResult;
  review: DocumentReview;
  reviewer: ProfessionalReviewer;
}

interface NotificationVariant {
  actionText: string;
  gradient: string;
  icon: React.ComponentType<any>;
  message: string;
  title: string;
  type: 'info' | 'success' | 'warning';
}

export function ReviewCompletionNotifier({
  review: _review,
  result,
  reviewer,
  onViewReport,
  onRateReview,
  onDismiss,
  className,
}: ReviewCompletionNotifierProps) {
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getNotificationVariant = (): NotificationVariant => {
    if (result.overall_status === 'approved') {
      return {
        type: 'success',
        title: '🎉 Excellent News!',
        message:
          'Your document has been professionally approved with high confidence.',
        icon: CheckCircle,
        gradient: 'from-green-500 to-emerald-600',
        actionText: 'View Full Report',
      };
    } else if (result.overall_status === 'approved_with_changes') {
      return {
        type: 'info',
        title: '✅ Review Complete',
        message:
          'Your document is solid with some helpful recommendations for improvement.',
        icon: FileText,
        gradient: 'from-blue-500 to-indigo-600',
        actionText: 'See Recommendations',
      };
    } else if (result.overall_status === 'requires_revision') {
      return {
        type: 'warning',
        title: '⚠️ Action Required',
        message:
          "Important issues were found that need attention for your family's protection.",
        icon: AlertTriangle,
        gradient: 'from-orange-500 to-amber-600',
        actionText: 'View Issues',
      };
    } else {
      return {
        type: 'warning',
        title: '🚨 Significant Issues',
        message:
          "Critical issues were identified that could impact your family's security.",
        icon: AlertTriangle,
        gradient: 'from-red-500 to-rose-600',
        actionText: 'See Critical Issues',
      };
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please provide a star rating for this review.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onRateReview?.(rating, feedback);
      toast({
        title: 'Thank You!',
        description:
          'Your feedback helps us maintain high-quality professional services.',
      });
      setShowRating(false);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to submit rating. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const variant = getNotificationVariant();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className={cn('relative', className)}
      >
        {/* Main Notification Card */}
        <Card
          className={cn(
            'overflow-hidden border-0 shadow-xl',
            variant.type === 'success' &&
              'bg-gradient-to-br from-green-50 to-emerald-50',
            variant.type === 'info' &&
              'bg-gradient-to-br from-blue-50 to-indigo-50',
            variant.type === 'warning' &&
              'bg-gradient-to-br from-orange-50 to-amber-50'
          )}
        >
          {/* Header with gradient */}
          <div
            className={cn(
              'bg-gradient-to-r text-white p-6 relative overflow-hidden',
              variant.gradient
            )}
          >
            {/* Background decoration */}
            <div className='absolute inset-0 bg-black/10' />
            <motion.div
              className='absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/20'
              animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            <div className='relative flex items-start justify-between'>
              <div className='flex-1'>
                <motion.h2
                  className='text-2xl font-bold mb-2'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {variant.title}
                </motion.h2>
                <motion.p
                  className='text-white/90 leading-relaxed'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {variant.message}
                </motion.p>
              </div>

              {onDismiss && (
                <Button
                  variant="ghost"
                  size='sm'
                  onClick={onDismiss}
                  className='text-white/80 hover:text-white hover:bg-white/20 relative z-10'
                >
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>

          <CardContent className='p-6 space-y-6'>
            {/* Review Summary Stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <motion.div
                className='text-center p-3 bg-white rounded-lg shadow-sm'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div
                  className={cn(
                    'text-2xl font-bold mb-1',
                    result.overall_status === 'approved'
                      ? 'text-green-600'
                      : result.overall_status.includes('approved')
                        ? 'text-blue-600'
                        : 'text-orange-600'
                  )}
                >
                  {result.overall_status.replace('_', ' ').toUpperCase()}
                </div>
                <p className='text-xs text-gray-600'>Overall Status</p>
              </motion.div>

              <motion.div
                className='text-center p-3 bg-white rounded-lg shadow-sm'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className='text-2xl font-bold text-emerald-600 mb-1'>
                  +{result.trust_score_impact}
                </div>
                <p className='text-xs text-gray-600'>Trust Score</p>
              </motion.div>

              <motion.div
                className='text-center p-3 bg-white rounded-lg shadow-sm'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className='text-2xl font-bold text-blue-600 mb-1'>
                  {result.recommendations.length}
                </div>
                <p className='text-xs text-gray-600'>Recommendations</p>
              </motion.div>

              <motion.div
                className='text-center p-3 bg-white rounded-lg shadow-sm'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className='text-2xl font-bold text-purple-600 mb-1'>
                  {result.legal_compliance_score}%
                </div>
                <p className='text-xs text-gray-600'>Compliance</p>
              </motion.div>
            </div>

            {/* Reviewer Information */}
            <div className='bg-white rounded-lg p-4 shadow-sm'>
              <h3 className='font-semibold text-gray-900 mb-3'>Reviewed by</h3>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold'>
                  {reviewer.full_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </div>
                <div>
                  <p className='font-medium text-gray-900'>
                    {reviewer.full_name}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {reviewer.professional_title}
                  </p>
                  {reviewer.law_firm_name && (
                    <p className='text-sm text-gray-500'>
                      {reviewer.law_firm_name}
                    </p>
                  )}
                </div>
                <div className='ml-auto flex items-center gap-1'>
                  <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                  <span className='text-sm font-medium'>4.9</span>
                </div>
              </div>
            </div>

            {/* Key Highlights */}
            {(result.recommendations.length > 0 ||
              result.issues_found.length > 0) && (
              <div className='space-y-3'>
                <h3 className='font-semibold text-gray-900'>Key Highlights</h3>

                {result.recommendations.slice(0, 2).map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className='flex items-start gap-3 p-3 bg-green-50 rounded-lg'
                  >
                    <ThumbsUp className='h-4 w-4 text-green-600 mt-0.5 flex-shrink-0' />
                    <div>
                      <p className='text-sm font-medium text-green-900'>
                        {rec.title}
                      </p>
                      <p className='text-xs text-green-700 leading-relaxed'>
                        {rec.description}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {result.issues_found.slice(0, 2).map((issue, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + index * 0.1 }}
                    className='flex items-start gap-3 p-3 bg-orange-50 rounded-lg'
                  >
                    <AlertTriangle className='h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0' />
                    <div>
                      <p className='text-sm font-medium text-orange-900'>
                        {issue.title}
                      </p>
                      <p className='text-xs text-orange-700 leading-relaxed'>
                        {issue.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 pt-4'>
              <Button
                onClick={onViewReport}
                className={cn(
                  'flex-1 bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all',
                  variant.gradient
                )}
              >
                {variant.actionText}
                <ArrowRight className='h-4 w-4 ml-2' />
              </Button>

              {onRateReview && (
                <Dialog open={showRating} onOpenChange={setShowRating}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className='flex-1 sm:flex-none'
                    >
                      <Star className='h-4 w-4 mr-2' />
                      Rate Review
                    </Button>
                  </DialogTrigger>

                  <DialogContent className='max-w-md'>
                    <div className='space-y-6'>
                      <div className='text-center'>
                        <h3 className='text-lg font-semibold mb-2'>
                          Rate This Review
                        </h3>
                        <p className='text-sm text-gray-600'>
                          How satisfied are you with {reviewer.full_name}'s
                          review?
                        </p>
                      </div>

                      {/* Star Rating */}
                      <div className='flex justify-center gap-1'>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className='p-1 hover:scale-110 transition-transform'
                          >
                            <Star
                              className={cn(
                                'h-8 w-8 transition-colors',
                                star <= rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              )}
                            />
                          </button>
                        ))}
                      </div>

                      {/* Feedback */}
                      <div>
                        <label className='text-sm font-medium text-gray-700 mb-2 block'>
                          Additional feedback (optional)
                        </label>
                        <Textarea
                          value={feedback}
                          onChange={e => setFeedback(e.target.value)}
                          placeholder='Share your experience with this professional review...'
                          rows={3}
                        />
                      </div>

                      {/* Submit */}
                      <div className='flex gap-3'>
                        <Button
                          variant="outline"
                          onClick={() => setShowRating(false)}
                          className='flex-1'
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitRating}
                          disabled={isSubmitting || rating === 0}
                          className='flex-1'
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Family Impact Message */}
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100'>
              <div className='flex items-start gap-3'>
                <Award className='h-5 w-5 text-blue-600 mt-0.5' />
                <div>
                  <h4 className='font-medium text-blue-900 mb-1'>
                    Family Protection Enhanced
                  </h4>
                  <p className='text-sm text-blue-800 leading-relaxed'>
                    This professional review strengthens your family's legal
                    protection. The insights provided help ensure your loved
                    ones are better secured and your wishes are legally sound.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating celebration particles for approved reviews */}
        {result.overall_status === 'approved' && (
          <div className='absolute inset-0 pointer-events-none overflow-hidden'>
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className='absolute w-2 h-2 bg-yellow-400 rounded-full'
                initial={{
                  x: Math.random() * 400,
                  y: '100%',
                  scale: 0,
                  rotate: 0,
                }}
                animate={{ y: '-10%', scale: [0, 1, 0], rotate: 360 }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Toast notification variant for less intrusive notifications
export function ReviewCompletionToast({
  review,
  result,
  reviewer,
  onViewReport,
}: {
  onViewReport: () => void;
  result: ReviewResult;
  review: DocumentReview;
  reviewer: ProfessionalReviewer;
}) {
  useEffect(() => {
    const getStatusEmoji = () => {
      switch (result.overall_status) {
        case 'approved':
          return '🎉';
        case 'approved_with_changes':
          return '✅';
        case 'requires_revision':
          return '⚠️';
        default:
          return '🚨';
      }
    };

    const getStatusMessage = () => {
      switch (result.overall_status) {
        case 'approved':
          return 'Your document has been approved!';
        case 'approved_with_changes':
          return 'Review complete with recommendations';
        case 'requires_revision':
          return 'Review complete - action required';
        default:
          return 'Review complete - critical issues found';
      }
    };

    toast({
      title: `${getStatusEmoji()} Professional Review Complete`,
      description: (
        <div className='space-y-2'>
          <p>{getStatusMessage()}</p>
          <p className='text-xs text-gray-600'>
            Reviewed by {reviewer.full_name} • Trust Score: +
            {result.trust_score_impact}
          </p>
          <Button size='sm' onClick={onViewReport} className='mt-2'>
            View Report
          </Button>
        </div>
      ),
      duration: 8000, // 8 seconds
    });
  }, [review, result, reviewer, onViewReport]);

  return null;
}
