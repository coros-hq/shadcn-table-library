'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '#/components/ui/badge'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils.ts'
import type { Invoice } from './data'

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.customer}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.email}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === 'Overdue' ? 'destructive' : 'secondary'
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {row.original.amount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
      </div>
    ),
  },
  { accessorKey: 'dueDate', header: 'Due' },
]

// Varied widths so the placeholder rows read as content, not a grid of bars
const SKELETON_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6', 'w-1/3']

interface DataTableProps {
  data: Invoice[]
  /** First load: no data yet, so render placeholder rows */
  isLoading?: boolean
  /** Background refetch: keep the current rows and dim them */
  isFetching?: boolean
  skeletonRows?: number
}

export function DataTable({
  data,
  isLoading = false,
  isFetching = false,
  skeletonRows = 5,
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const leafColumns = table.getAllLeafColumns()

  return (
    <div
      className="relative overflow-hidden rounded-md border"
      aria-busy={isLoading || isFetching}
    >
      {isFetching && !isLoading && (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-primary" />
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody
          className={cn(isFetching && 'opacity-60 transition-opacity')}
        >
          {isLoading
            ? Array.from({ length: skeletonRows }, (_, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-transparent">
                  {leafColumns.map((column, colIndex) => (
                    <TableCell key={column.id}>
                      <Skeleton
                        className={cn(
                          'h-4',
                          SKELETON_WIDTHS[
                            (rowIndex + colIndex) % SKELETON_WIDTHS.length
                          ],
                          column.id === 'amount' && 'ml-auto',
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )
}
