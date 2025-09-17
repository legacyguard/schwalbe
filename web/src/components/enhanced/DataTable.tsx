
import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  Filter,
  MoreHorizontal,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  className?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  description?: string;
  loading?: boolean;
  onExport?: () => void;
  pageSize?: number;
  searchKey?: string;
  searchPlaceholder?: string;
  showExport?: boolean;
  showViewOptions?: boolean;
  title?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  // _searchKey, // Not used
  searchPlaceholder = 'Search...',
  title,
  description,
  showViewOptions = true,
  showExport = true,
  onExport,
  loading = false,
  pageSize = 10,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const selectedRowsCount = Object.keys(rowSelection).length;

  return (
    <Card className={cn('w-full', className)}>
      <div className='p-6 space-y-4'>
        {/* Header */}
        {(title || description) && (
          <div className='space-y-1'>
            {title && <h3 className='text-lg font-semibold'>{title}</h3>}
            {description && (
              <p className='text-sm text-muted-foreground'>{description}</p>
            )}
          </div>
        )}

        {/* Toolbar */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex flex-1 items-center space-x-2'>
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ''}
                onChange={event => setGlobalFilter(event.target.value)}
                className='pl-9'
              />
            </div>

            {selectedRowsCount > 0 && (
              <Badge variant='secondary' className='ml-2'>
                {selectedRowsCount} selected
              </Badge>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            {showExport && (
              <Button
                variant='outline'
                size='sm'
                onClick={onExport}
                disabled={loading}
              >
                <Download className='mr-2 h-4 w-4' />
                Export
              </Button>
            )}

            {showViewOptions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <Filter className='mr-2 h-4 w-4' />
                    View
                    <ChevronDown className='ml-2 h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter(column => column.getCanHide())
                    .map(column => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className='capitalize'
                          checked={column.getIsVisible()}
                          onCheckedChange={value =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Table */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    <div className='flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='hover:bg-muted/50 transition-colors'
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            {selectedRowsCount > 0 && (
              <span>
                {selectedRowsCount} of {table.getFilteredRowModel().rows.length}{' '}
                row(s) selected.
              </span>
            )}
          </div>
          <div className='flex items-center space-x-2'>
            <p className='text-sm font-medium'>
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Helper components for common column types
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
