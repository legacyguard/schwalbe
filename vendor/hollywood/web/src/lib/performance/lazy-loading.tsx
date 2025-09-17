
/**
 * Lazy Loading Utilities for Performance Optimization
 * Implements code splitting and progressive loading for large components
 */

import React, {
  type ComponentType,
  lazy,
  type ReactElement,
  Suspense,
} from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Generic loading skeleton component
export const LoadingSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`space-y-4 ${className}`}>
    <Skeleton className='h-8 w-3/4' />
    <Skeleton className='h-32 w-full' />
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      <Skeleton className='h-24 w-full' />
      <Skeleton className='h-24 w-full' />
      <Skeleton className='h-24 w-full' />
    </div>
  </div>
);

// Analytics loading skeleton
export const AnalyticsLoadingSkeleton = () => (
  <div className='space-y-6'>
    <div className='flex items-center justify-between'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-48' />
      </div>
      <Skeleton className='h-10 w-32' />
    </div>

    {/* Key Metrics Grid */}
    <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4'>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className='space-y-2'>
          <Skeleton className='h-16 w-full' />
        </div>
      ))}
    </div>

    {/* Main Content */}
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <Skeleton className='h-64 w-full' />
      <Skeleton className='h-64 w-full' />
    </div>
  </div>
);

// Family collaboration loading skeleton
export const FamilyCollaborationLoadingSkeleton = () => (
  <div className='space-y-6'>
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='space-y-3 p-4 border rounded-lg'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-10 w-10 rounded-full' />
            <div className='space-y-1'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3 w-16' />
            </div>
          </div>
          <Skeleton className='h-20 w-full' />
        </div>
      ))}
    </div>
  </div>
);

// Professional review loading skeleton
export const ProfessionalReviewLoadingSkeleton = () => (
  <div className='space-y-4'>
    <div className='flex items-center gap-4'>
      <Skeleton className='h-16 w-16 rounded-full' />
      <div className='space-y-2'>
        <Skeleton className='h-6 w-48' />
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-4 w-24' />
      </div>
    </div>
    <Skeleton className='h-32 w-full' />
    <div className='flex gap-2'>
      <Skeleton className='h-10 w-24' />
      <Skeleton className='h-10 w-24' />
    </div>
  </div>
);

// Generic lazy component wrapper with error boundary
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactElement,
  _errorFallback?: ReactElement
) => {
  const LazyComponent = lazy(importFn);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <LoadingSkeleton />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Lazy load analytics components with appropriate skeletons
export const LazyAdvancedAnalyticsDashboard = createLazyComponent(
  () =>
    import('@/components/analytics/AdvancedAnalyticsDashboard').then(m => ({
      default: m.AdvancedAnalyticsDashboard,
    })),
  <AnalyticsLoadingSkeleton />
);

export const LazyFamilyProtectionAnalytics = createLazyComponent(
  () =>
    import('@/components/analytics/FamilyProtectionAnalytics').then(m => ({
      default: m.FamilyProtectionAnalytics,
    })),
  <AnalyticsLoadingSkeleton />
);

export const LazyLegacyCompletionTracking = createLazyComponent(
  () =>
    import('@/components/analytics/LegacyCompletionTracking').then(m => ({
      default: m.LegacyCompletionTracking,
    })),
  <AnalyticsLoadingSkeleton />
);

// Lazy load family collaboration components
export const LazyFamilyCollaborationCenter = createLazyComponent(
  () =>
    import('@/components/family/FamilyCommunicationCenter').then(m => ({
      default: m.FamilyCommunicationCenter,
    })),
  <FamilyCollaborationLoadingSkeleton />
);

export const LazyFamilyHistoryPreservation = createLazyComponent(
  () =>
    import('@/components/family/FamilyHistoryPreservation').then(m => ({
      default: m.FamilyHistoryPreservation,
    })),
  <FamilyCollaborationLoadingSkeleton />
);

// Lazy load professional review components
export const LazyProfessionalReviewNetwork = createLazyComponent(
  () =>
    import('@/components/legacy/ProfessionalReviewNetwork').then(m => ({
      default: m.ProfessionalReviewNetwork,
    })),
  <ProfessionalReviewLoadingSkeleton />
);
