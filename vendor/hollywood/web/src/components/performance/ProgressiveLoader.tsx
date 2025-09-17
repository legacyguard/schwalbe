
/**
 * Progressive Loading Component
 * Handles progressive loading with smooth animations and loading states
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ChevronDown, FileText, Loader2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressiveLoaderProps<T> {
  autoLoad?: boolean;
  autoLoadThreshold?: number;
  batchSize?: number;
  className?: string;
  emptyStateText?: string;
  items: T[];
  loadingText?: string;
  loadMoreText?: string;
  onLoadMore?: (visibleCount: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderSkeleton?: () => React.ReactNode;
  showProgress?: boolean;
}

export function ProgressiveLoader<T>({
  items,
  renderItem,
  renderSkeleton,
  batchSize = 10,
  className,
  loadMoreText = 'Load More',
  emptyStateText = 'No items to display',
  loadingText = 'Loading more items...',
  onLoadMore,
  showProgress = true,
  autoLoad = false,
  autoLoadThreshold = 200, // pixels from bottom
}: ProgressiveLoaderProps<T>) {
  const { visibleItems, loadMore, hasMore, progress, isLoading } = {
    visibleItems: items.slice(0, batchSize),
    hasMore: items.length > batchSize,
    progress: Math.min((batchSize / items.length) * 100, 100),
    isLoading: false,
    loadMore: () => {},
  };

  const loaderRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  // Intersection Observer for auto-loading
  useEffect(() => {
    if (!autoLoad || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
          if (entry.isIntersecting && !isLoading) {
            loadMore();
            onLoadMore?.(visibleItems.length);
          }
        }
      },
      {
        rootMargin: `${autoLoadThreshold}px`,
        threshold: 0.1,
      }
    );

    const currentRef = loaderRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [
    autoLoad,
    autoLoadThreshold,
    hasMore,
    isLoading,
    loadMore,
    onLoadMore,
    visibleItems.length,
  ]);

  const handleLoadMore = useCallback(() => {
    loadMore();
    onLoadMore?.(visibleItems.length);
  }, [loadMore, onLoadMore, visibleItems.length]);

  if (items.length === 0) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <CardContent>
          <div className='flex flex-col items-center space-y-4'>
            <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center'>
              <FileText className='w-8 h-8 text-gray-400' />
            </div>
            <div className='space-y-1'>
              <h3 className='text-lg font-medium text-gray-900'>
                No Items Found
              </h3>
              <p className='text-sm text-gray-500'>{emptyStateText}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress indicator */}
      {showProgress && items.length > batchSize && (
        <div className='flex items-center space-x-4 p-4 bg-gray-50 rounded-lg'>
          <div className='flex-1'>
            <div className='flex items-center justify-between text-sm text-gray-600 mb-1'>
              <span>
                Showing {visibleItems.length} of {items.length} items
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className='h-2' />
          </div>
        </div>
      )}

      {/* Visible items */}
      <div className='space-y-3'>
        <AnimatePresence>
          {visibleItems.map((item: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {renderItem(item, index)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className='space-y-3'>
          {Array.from({ length: Math.min(batchSize, 3) }).map((_, index) => (
            <motion.div
              key={`skeleton-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderSkeleton ? (
                renderSkeleton()
              ) : (
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center space-x-4'>
                      <Skeleton className='h-10 w-10 rounded-full' />
                      <div className='space-y-2 flex-1'>
                        <Skeleton className='h-4 w-3/4' />
                        <Skeleton className='h-3 w-1/2' />
                      </div>
                      <Skeleton className='h-6 w-16' />
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Load more button or auto-load trigger */}
      {hasMore && (
        <div
          ref={loaderRef}
          className='flex flex-col items-center space-y-4 py-6'
        >
          {!autoLoad && (
            <Button
              onClick={handleLoadMore}
              disabled={isLoading}
              variant='outline'
              className='min-w-[120px]'
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  {loadingText}
                </>
              ) : (
                <>
                  <ChevronDown className='w-4 h-4 mr-2' />
                  {loadMoreText}
                </>
              )}
            </Button>
          )}

          {autoLoad && isIntersecting && isLoading && (
            <div className='flex items-center space-x-2 text-sm text-gray-500'>
              <Loader2 className='w-4 h-4 animate-spin' />
              <span>{loadingText}</span>
            </div>
          )}
        </div>
      )}

      {/* Completion message */}
      {!hasMore && visibleItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='text-center py-4 text-sm text-gray-500'
        >
          All items loaded ({visibleItems.length} total)
        </motion.div>
      )}
    </div>
  );
}

// Specialized progressive loaders for different content types

interface FamilyMember {
  avatar?: string;
  documentsCount?: number;
  id: string;
  lastActive?: Date;
  name: string;
  role: string;
}

export function FamilyMemberProgressiveLoader({
  members,
  className,
}: Omit<
  ProgressiveLoaderProps<FamilyMember>,
  'renderItem' | 'renderSkeleton'
> & {
  members: FamilyMember[];
}) {
  const renderMember = (member: FamilyMember) => (
    <Card className='hover:shadow-md transition-shadow'>
      <CardContent className='p-4'>
        <div className='flex items-center space-x-4'>
          <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium'>
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className='w-full h-full rounded-full object-cover'
              />
            ) : (
              member.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center space-x-2'>
              <h4 className='font-medium text-gray-900 truncate'>
                {member.name}
              </h4>
              <span className='text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full'>
                {member.role}
              </span>
            </div>
            <div className='flex items-center space-x-4 mt-1'>
              {member.documentsCount !== undefined && (
                <div className='flex items-center text-sm text-gray-500'>
                  <FileText className='w-3 h-3 mr-1' />
                  {member.documentsCount} docs
                </div>
              )}
              {member.lastActive && (
                <div className='flex items-center text-sm text-gray-500'>
                  <Calendar className='w-3 h-3 mr-1' />
                  {member.lastActive.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <Users className='w-5 h-5 text-gray-400' />
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => (
    <Card>
      <CardContent className='p-4'>
        <div className='flex items-center space-x-4'>
          <Skeleton className='h-10 w-10 rounded-full' />
          <div className='space-y-2 flex-1'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-24' />
          </div>
          <Skeleton className='h-5 w-5' />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProgressiveLoader
      items={members}
      renderItem={renderMember}
      renderSkeleton={renderSkeleton}
      className={className || ''}
      emptyStateText='No family members found'
    />
  );
}

// Export both individual and bulk progressive loaders
