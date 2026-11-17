'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Check } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { RowActions } from './row-actions'
import type { Row } from './data'

// Dates are stored as ISO strings; formatting in UTC keeps the server and the
// browser from disagreeing about which day it is.
const dateFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

export const columns: ColumnDef<Row>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
  {
    accessorKey: 'budget',
    header: 'Budget',
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.budget.toLocaleString('en-US')}
      </span>
    ),
    meta: { align: 'right' },
  },
  {
    accessorKey: 'due',
    header: 'Due',
    cell: ({ row }) => (
      <span className="tabular-nums">
        {dateFormat.format(new Date(`${row.original.due}T00:00:00Z`))}
      </span>
    ),
  },
  {
    accessorKey: 'done',
    header: 'Done',
    cell: ({ row }) =>
      row.original.done ? <Check className="size-4" aria-label="Yes" /> : null,
  },
  {
    accessorKey: 'note',
    header: 'Note',
  },
  {
    id: 'actions',
    enableSorting: false,
    enableHiding: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row, table }) => (
      <RowActions
        row={row}
        table={table}
        actions={['copy']}
      />
    ),
  },
]
