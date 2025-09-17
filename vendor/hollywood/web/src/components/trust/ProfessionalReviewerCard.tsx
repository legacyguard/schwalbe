
/**
 * Professional Reviewer Profile Card Component
 * Displays reviewer credentials and expertise for trust building
 */

import {
  Award,
  Briefcase,
  CheckCircle,
  Clock,
  GraduationCap,
  MapPin,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { ProfessionalReviewer } from '@/types/professional';

interface ProfessionalReviewerCardProps {
  className?: string;
  onContact?: (reviewer: ProfessionalReviewer) => void;
  reviewer: ProfessionalReviewer;
  showContactButton?: boolean;
  showStats?: boolean;
  variant?: 'compact' | 'full' | 'minimal';
}

export function ProfessionalReviewerCard({
  reviewer,
  variant = 'full',
  showContactButton = true,
  showStats = true,
  onContact,
  className,
}: ProfessionalReviewerCardProps) {
  const getAvailabilityColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'busy':
        return 'text-yellow-600 bg-yellow-100';
      case 'unavailable':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAvailabilityLabel = (status?: string) => {
    switch (status) {
      case 'available':
        return 'Available Now';
      case 'busy':
        return 'Limited Availability';
      case 'unavailable':
        return 'Currently Booked';
      default:
        return reviewer.status === 'active' ? 'Available' : 'Unavailable';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'h-4 w-4',
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        )}
      />
    ));
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-3 p-2', className)}>
        <Avatar className='h-8 w-8'>
          <AvatarImage
            src={reviewer.profile_image_url}
            alt={reviewer.fullName}
          />
          <AvatarFallback className='text-xs'>
            {reviewer.fullName
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium truncate'>{reviewer.fullName}</p>
          <p className='text-xs text-muted-foreground truncate'>
            {reviewer.professional_title}
          </p>
        </div>
        <div className='flex items-center gap-1'>
          {renderStars(3).slice(0, 3)}
          <span className='text-xs text-muted-foreground ml-1'>4.5</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className='p-4'>
          <div className='flex items-start gap-3'>
            <Avatar className='h-12 w-12'>
              <AvatarImage
                src={reviewer.profile_image_url}
                alt={reviewer.fullName}
              />
              <AvatarFallback>
                {reviewer.fullName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className='flex-1 space-y-2'>
              <div>
                <h3 className='font-semibold text-base'>{reviewer.fullName}</h3>
                <p className='text-sm text-muted-foreground'>
                  {reviewer.professional_title}
                </p>
              </div>

              <div className='flex items-center gap-4 text-sm'>
                <div className='flex items-center gap-1'>
                  {renderStars(4)}
                  <span className='text-muted-foreground ml-1'>
                    4.5 (15 reviews)
                  </span>
                </div>

                <Badge
                  className={cn(
                    'text-xs',
                    getAvailabilityColor(reviewer.status)
                  )}
                >
                  {getAvailabilityLabel(reviewer.status)}
                </Badge>
              </div>

              {showContactButton && (
                <Button
                  size='sm'
                  variant="outline"
                  onClick={() => onContact?.(reviewer)}
                  className='w-full'
                >
                  Request Review
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={cn('w-full hover:shadow-lg transition-shadow', className)}>
      <CardHeader className='pb-4'>
        <div className='flex items-start gap-4'>
          <Avatar className='h-16 w-16'>
            <AvatarImage
              src={reviewer.profile_image_url}
              alt={reviewer.fullName}
            />
            <AvatarFallback className='text-lg'>
              {reviewer.fullName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className='flex-1 space-y-2'>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='text-xl font-bold'>{reviewer.fullName}</h3>
                <p className='text-muted-foreground font-medium'>
                  {reviewer.professional_title}
                </p>
              </div>
              <Badge
                className={cn('ml-2', getAvailabilityColor(reviewer.status))}
              >
                {getAvailabilityLabel(reviewer.status)}
              </Badge>
            </div>

            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-1'>
                {renderStars(4)}
                <span className='text-sm font-medium ml-2'>4.8</span>
                <span className='text-sm text-muted-foreground'>
                  (24 reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Specialization */}
        {reviewer.specializations && reviewer.specializations.length > 0 && (
          <div className='flex items-center gap-2'>
            <Briefcase className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm capitalize font-medium'>
              {reviewer.specializations[0].name}
            </span>
          </div>
        )}

        {/* Location */}
        {reviewer.jurisdiction && (
          <div className='flex items-center gap-2'>
            <MapPin className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm'>{reviewer.jurisdiction}</span>
          </div>
        )}

        {/* Experience */}
        {reviewer.experience_years && (
          <div className='flex items-center gap-2'>
            <GraduationCap className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm'>
              {reviewer.experience_years} years of experience
            </span>
          </div>
        )}

        {/* Bio */}
        {reviewer.bio && (
          <div className='pt-2'>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              {reviewer.bio}
            </p>
          </div>
        )}

        {/* Stats */}
        {showStats && (
          <div className='grid grid-cols-3 gap-4 pt-4 border-t'>
            <div className='text-center'>
              <div className='flex items-center justify-center gap-1 mb-1'>
                <CheckCircle className='h-4 w-4 text-green-600' />
                <span className='text-lg font-bold'>15</span>
              </div>
              <p className='text-xs text-muted-foreground'>Reviews</p>
            </div>

            <div className='text-center'>
              <div className='flex items-center justify-center gap-1 mb-1'>
                <Award className='h-4 w-4 text-blue-600' />
                <span className='text-lg font-bold'>96%</span>
              </div>
              <p className='text-xs text-muted-foreground'>Success Rate</p>
            </div>

            <div className='text-center'>
              <div className='flex items-center justify-center gap-1 mb-1'>
                <Clock className='h-4 w-4 text-orange-600' />
                <span className='text-lg font-bold'>2d</span>
              </div>
              <p className='text-xs text-muted-foreground'>Avg. Time</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showContactButton && (
          <div className='pt-4 space-y-2'>
            <Button
              onClick={() => onContact?.(reviewer)}
              className='w-full'
              disabled={reviewer.status === 'inactive'}
            >
              {reviewer.status === 'inactive'
                ? 'Currently Unavailable'
                : 'Request Professional Review'}
            </Button>
            {reviewer.hourly_rate && (
              <p className='text-center text-sm text-muted-foreground'>
                Starting from ${reviewer.hourly_rate}/hour
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
