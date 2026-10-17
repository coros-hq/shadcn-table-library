'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '#/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { ErrorState } from './error-state'
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

interface DataTableProps {
  data: Invoice[]
  error?: Error | null
  onRetry?: () => void
  isRetrying?: boolean
}

export function DataTable({
  data,
  error = null,
  onRetry,
  isRetrying = false,
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const rows = table.getRowModel().rows
  // With rows already on screen, keep them and show the error as a banner;
  // with nothing to show, the error takes the place of the body.
  const hasStaleData = rows.length > 0

  return (
    <div className="space-y-3">
      {error && hasStaleData && (
        <ErrorState
          variant="banner"
          title="Couldn't refresh invoices"
          description={`${error.message}. Showing the last loaded data.`}
          onRetry={onRetry}
          isRetrying={isRetrying}
        />
      )}
      <div className="overflow-hidden rounded-md border">
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
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
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
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0">
                  {error ? (
                    <ErrorState
                      title="Something went wrong"
                      description={`${error.message}. Check your connection and try again.`}
                      onRetry={onRetry}
                      isRetrying={isRetrying}
                    />
                  ) : null}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
