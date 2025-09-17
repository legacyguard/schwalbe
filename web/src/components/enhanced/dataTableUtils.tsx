
import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// cn import removed as unused

export const createSelectColumn = <TData,>(): ColumnDef<TData> => ({
  id: 'select',
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
      aria-label='Select all'
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={value => row.toggleSelected(!!value)}
      aria-label='Select row'
    />
  ),
  enableSorting: false,
  enableHiding: false,
});

export const createSortableHeader = (label: string) => {
  return ({
    column,
  }: {
    column: {
      getIsSorted: () => 'asc' | 'desc' | false;
      toggleSorting: (ascending: boolean) => void;
    };
  }) => {
    return (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='-ml-3 h-8 data-[state=open]:bg-accent'
      >
        {label}
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    );
  };
};

export const createActionsColumn = <TData,>(
  actions: Array<{
    icon?: React.ReactNode;
    label: string;
    onClick: (row: TData) => void;
  }>
): ColumnDef<TData> => ({
  id: 'actions',
  enableHiding: false,
  cell: ({ row }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => action.onClick(row.original)}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
});
