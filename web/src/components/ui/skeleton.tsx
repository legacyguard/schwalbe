
import React from 'react';
import { cn } from '@/lib/utils';

// Optimized with React.memo to prevent unnecessary re-renders
const Skeleton = React.memo(function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
});

export { Skeleton };
