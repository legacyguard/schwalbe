
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { badgeVariants } from './badge-variants';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Memoized Badge component optimized with React.memo
 * Prevents unnecessary re-renders when props haven't changed
 */
const Badge = React.memo(({ className, variant, ...props }: BadgeProps) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
});
Badge.displayName = 'Badge';

export { Badge };
