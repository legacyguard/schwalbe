
import * as React from 'react';

import { cn } from '@/lib/utils';

// Optimized with React.memo to prevent unnecessary re-renders
const Table = React.memo(
  React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
  >(({ className, ...props }, ref) => (
    <div className='relative w-full overflow-auto'>
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  ))
);
Table.displayName = 'Table';

/**
 * Memoized TableHeader component optimized with React.memo
 * Prevents unnecessary re-renders when props haven't changed
 */
const TableHeader = React.memo(
  React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
  >(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
  ))
);
TableHeader.displayName = 'TableHeader';

/**
 * Memoized TableBody component optimized with React.memo
 * Prevents unnecessary re-renders when props haven't changed
 */
const TableBody = React.memo(
  React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
  >(({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  ))
);
TableBody.displayName = 'TableBody';

/**
 * Memoized TableFooter component optimized with React.memo
 * Prevents unnecessary re-renders when props haven't changed
 */
const TableFooter = React.memo(
  React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
  >(({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  ))
);
TableFooter.displayName = 'TableFooter';

// Optimized with React.memo to prevent unnecessary re-renders
const TableRow = React.memo(
  React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
  >(({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    />
  ))
);
TableRow.displayName = 'TableRow';

/**
 * Memoized TableHead component optimized with React.memo
 * Prevents unnecessary re-renders when props haven't changed
 */
const TableHead = React.memo(
  React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
  >(({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  ))
);
TableHead.displayName = 'TableHead';

// Optimized with React.memo to prevent unnecessary re-renders
const TableCell = React.memo(
  React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
  >(({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  ))
);
TableCell.displayName = 'TableCell';

/**
 * Memoized TableCaption component optimized with React.memo
 * Prevents unnecessary re-renders when props haven't changed
 */
const TableCaption = React.memo(
  React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
  >(({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  ))
);
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
