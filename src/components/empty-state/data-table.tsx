'use client'

import { useMemo, useState } from 'react'
import { Inbox, Plus, SearchX } from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { EmptyState } from './empty-state'
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
  onCreate?: () => void
}

export function DataTable({ data, onCreate }: DataTableProps) {
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const rows = table.getRowModel().rows
  // Two different empties: nothing exists yet vs. nothing matches the filter
  const hasNoData = data.length === 0
  const emptyState = useMemo(
    () =>
      hasNoData ? (
        <EmptyState
          icon={<Inbox />}
          title="No invoices yet"
          description="Invoices you create will show up here so you can track what's paid and what's overdue."
          action={
            onCreate && (
              <Button size="sm" onClick={onCreate}>
                <Plus /> Create invoice
              </Button>
            )
          }
        />
      ) : (
        <EmptyState
          icon={<SearchX />}
          title="No results found"
          description={`Nothing matches "${globalFilter}". Try a different search term.`}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGlobalFilter('')}
            >
              Clear search
            </Button>
          }
        />
      ),
    [hasNoData, globalFilter, onCreate],
  )

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search invoices..."
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        disabled={hasNoData}
        className="max-w-xs"
      />
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
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
