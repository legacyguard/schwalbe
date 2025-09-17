
/**
 * Professional Review Status Tracker
 * Tracks and displays the status of professional document reviews
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Mail,
  MessageSquare,
  RefreshCw,
  Scale,
  Star,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type {
  DocumentReview,
  ProfessionalReviewer,
  ReviewResult,
} from '@/types/professional';

interface ReviewStatusTrackerProps {
  className?: string;
  onContactReviewer?: () => void;
  onDownloadReport?: () => void;
  onViewResult?: () => void;
  review: DocumentReview;
  reviewer?: ProfessionalReviewer;
  reviewResult?: ReviewResult;
}

interface ReviewStep {
  description: string;
  icon: React.ComponentType<any>;
  id: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
  title: string;
}

export function ReviewStatusTracker({
  review,
  reviewer,
  reviewResult,
  onContactReviewer,
  onViewResult,
  onDownloadReport,
  className,
}: ReviewStatusTrackerProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState('');

  // Calculate progress based on status
  useEffect(() => {
    const progressMap = {
      requested: 10,
      assigned: 25,
      in_progress: 60,
      completed: 100,
      rejected: 0,
    };
    setProgress(progressMap[review.status] || 0);
  }, [review.status]);

  // Update time elapsed
  useEffect(() => {
    const updateTimeElapsed = () => {
      const start = new Date(review.requested_at);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - start.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 24) {
        setTimeElapsed(t('professional.review.timeElapsed.hoursAgo', { hours: diffInHours }));
      } else {
        const days = Math.floor(diffInHours / 24);
        setTimeElapsed(
          days === 1
            ? t('professional.review.timeElapsed.dayAgo', { days })
            : t('professional.review.timeElapsed.daysAgo', { days })
        );
      }
    };

    updateTimeElapsed();
    const interval = setInterval(updateTimeElapsed, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [review.requested_at]);

  const getStatusColor = (status: DocumentReview['status']) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusMessage = () => {
    switch (review.status) {
      case 'requested':
        return {
          title: t('professional.review.status.requested'),
          message: t('professional.review.messages.matchingAttorney'),
          action: t('professional.review.actions.typicallyCompleted'),
        };
      case 'assigned':
        return {
          title: t('professional.review.status.assigned'),
          message: t('professional.review.messages.attorneyAssigned', {
            name: reviewer?.full_name || 'Your attorney'
          }),
          action: t('professional.review.actions.reviewWillBegin'),
        };
      case 'in_progress':
        return {
          title: t('professional.review.status.inProgress'),
          message: t('professional.review.messages.reviewInProgress', {
            name: reviewer?.full_name || 'Your attorney'
          }),
          action: t('professional.review.actions.expectedCompletion', {
            date: review.due_date ? new Date(review.due_date).toLocaleDateString() : '2-3 days'
          }),
        };
      case 'completed':
        return {
          title: t('professional.review.status.completed'),
          message: t('professional.review.messages.reviewComplete'),
          action: t('professional.review.actions.viewDetailedReport'),
        };
      case 'rejected':
        return {
          title: t('professional.review.status.rejected'),
          message: t('professional.review.messages.reviewDeclined'),
          action: t('professional.review.actions.newAssignment'),
        };
      default:
        return {
          title: t('professional.review.status.processing'),
          message: t('professional.review.messages.processing'),
          action: '',
        };
    }
  };

  const getReviewSteps = (): ReviewStep[] => {
    const steps: ReviewStep[] = [
      {
        id: 'requested',
        title: t('professional.review.steps.reviewRequested'),
        description: t('professional.review.steps.professionalReviewRequested'),
        status: 'completed',
        timestamp: review.requested_at,
        icon: FileText,
      },
      {
        id: 'assigned',
        title: t('professional.review.steps.attorneyAssigned'),
        description: reviewer
          ? t('professional.review.steps.assignedTo', { name: reviewer.full_name })
          : t('professional.review.steps.waitingForAssignment'),
        status: review.status === 'requested' ? 'pending' : 'completed',
        timestamp: review.assigned_at,
        icon: User,
      },
      {
        id: 'in_progress',
        title: t('professional.review.steps.reviewInProgress'),
        description: t('professional.review.steps.attorneyConductingReview'),
        status:
          review.status === 'completed'
            ? 'completed'
            : review.status === 'in_progress'
              ? 'current'
              : 'pending',
        timestamp:
          review.status === 'in_progress'
            ? new Date().toISOString()
            : undefined,
        icon: Scale,
      },
      {
        id: 'completed',
        title: t('professional.review.steps.reviewComplete'),
        description: t('professional.review.steps.reportsAvailable'),
        status: review.status === 'completed' ? 'completed' : 'pending',
        timestamp: review.completed_at,
        icon: CheckCircle,
      },
    ];

    return steps;
  };

  const statusInfo = getStatusMessage();
  const steps = getReviewSteps();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Status Header */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-start justify-between mb-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Professional Review Status
              </h2>
              <div className='flex items-center gap-3'>
                <Badge className={cn('text-sm', getStatusColor(review.status))}>
                  {review.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className='text-gray-500 text-sm'>
                  Requested {timeElapsed}
                </span>
              </div>
            </div>

            <div className='text-right'>
              <div className='text-3xl font-bold text-gray-900 mb-1'>
                {progress}%
              </div>
              <p className='text-sm text-gray-600'>Complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className='mb-6'>
            <Progress value={progress} className='h-3' />
          </div>

          {/* Status Message */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <div className='h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                {review.status === 'completed' ? (
                  <CheckCircle className='h-5 w-5 text-blue-600' />
                ) : review.status === 'rejected' ? (
                  <AlertTriangle className='h-5 w-5 text-red-600' />
                ) : (
                  <Clock className='h-5 w-5 text-blue-600' />
                )}
              </div>
              <div>
                <h3 className='font-semibold text-blue-900 mb-1'>
                  {statusInfo.title}
                </h3>
                <p className='text-blue-800 text-sm mb-2 leading-relaxed'>
                  {statusInfo.message}
                </p>
                {statusInfo.action && (
                  <p className='text-blue-600 text-xs font-medium'>
                    {statusInfo.action}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attorney Information */}
      {reviewer && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              Your Assigned Attorney
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-start gap-4'>
              <Avatar className='h-16 w-16'>
                <AvatarImage src={reviewer.profile_image_url} />
                <AvatarFallback className='bg-blue-100 text-blue-700 text-lg'>
                  {reviewer.full_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>

              <div className='flex-1'>
                <h3 className='font-semibold text-lg text-gray-900 mb-1'>
                  {reviewer.full_name}
                </h3>
                <p className='text-gray-600 mb-2'>
                  {reviewer.professional_title}
                </p>
                {reviewer.law_firm_name && (
                  <p className='text-gray-500 text-sm mb-2'>
                    {reviewer.law_firm_name}
                  </p>
                )}

                <div className='flex items-center gap-4 mb-3'>
                  <div className='flex items-center gap-1'>
                    <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    <span className='text-sm font-medium'>4.9</span>
                    <span className='text-xs text-gray-500'>(127 reviews)</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Scale className='h-4 w-4 text-blue-600' />
                    <span className='text-sm'>
                      {reviewer.experience_years}+ years
                    </span>
                  </div>
                </div>

                <div className='flex flex-wrap gap-2 mb-4'>
                  {reviewer.specializations.slice(0, 3).map(spec => (
                    <Badge
                      key={spec.id}
                      variant='secondary'
                      className='text-xs'
                    >
                      {spec.name}
                    </Badge>
                  ))}
                </div>

                {onContactReviewer && review.status === 'in_progress' && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={onContactReviewer}
                    className='flex items-center gap-2'
                  >
                    <MessageSquare className='h-4 w-4' />
                    Contact Attorney
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Review Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className='flex items-start gap-4'
              >
                <div className='relative'>
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full border-2 flex items-center justify-center',
                      step.status === 'completed'
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : step.status === 'current'
                          ? 'bg-blue-100 border-blue-500 text-blue-700 animate-pulse'
                          : 'bg-gray-100 border-gray-300 text-gray-500'
                    )}
                  >
                    <step.icon className='h-5 w-5' />
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'absolute top-10 left-5 w-0.5 h-8',
                        step.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      )}
                    />
                  )}
                </div>

                <div className='flex-1 pb-8'>
                  <h4
                    className={cn(
                      'font-medium mb-1',
                      step.status === 'completed'
                        ? 'text-green-900'
                        : step.status === 'current'
                          ? 'text-blue-900'
                          : 'text-gray-500'
                    )}
                  >
                    {step.title}
                  </h4>
                  <p className='text-gray-600 text-sm mb-1'>
                    {step.description}
                  </p>
                  {step.timestamp && (
                    <p className='text-xs text-gray-500'>
                      {new Date(step.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Results */}
      {review.status === 'completed' && reviewResult && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-600' />
              Review Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='text-center p-4 bg-blue-50 rounded-lg'>
                  <div className='text-2xl font-bold text-blue-700 mb-1'>
                    {reviewResult.overall_status
                      .replace('_', ' ')
                      .toUpperCase()}
                  </div>
                  <p className='text-blue-600 text-sm'>Overall Status</p>
                </div>

                <div className='text-center p-4 bg-green-50 rounded-lg'>
                  <div className='text-2xl font-bold text-green-700 mb-1'>
                    +{reviewResult.trust_score_impact}
                  </div>
                  <p className='text-green-600 text-sm'>Trust Score Impact</p>
                </div>

                <div className='text-center p-4 bg-purple-50 rounded-lg'>
                  <div className='text-2xl font-bold text-purple-700 mb-1'>
                    {reviewResult.recommendations.length}
                  </div>
                  <p className='text-purple-600 text-sm'>Recommendations</p>
                </div>
              </div>

              {reviewResult.summary && (
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h4 className='font-semibold mb-2'>Review Summary</h4>
                  <p className='text-gray-700 text-sm leading-relaxed'>
                    {reviewResult.summary}
                  </p>
                </div>
              )}

              <div className='flex gap-3'>
                {onViewResult && (
                  <Button
                    onClick={onViewResult}
                    className='flex items-center gap-2'
                  >
                    <Eye className='h-4 w-4' />
                    View Detailed Report
                  </Button>
                )}
                {onDownloadReport && (
                  <Button
                    variant='outline'
                    onClick={onDownloadReport}
                    className='flex items-center gap-2'
                  >
                    <Download className='h-4 w-4' />
                    Download Report
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Actions */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium text-gray-900 mb-1'>Need Help?</p>
              <p className='text-sm text-gray-600'>
                Our support team is here to assist you throughout the review
                process.
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='flex items-center gap-2'
              >
                <RefreshCw className='h-4 w-4' />
                Refresh Status
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='flex items-center gap-2'
              >
                <Mail className='h-4 w-4' />
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
