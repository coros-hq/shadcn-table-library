'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '#/components/ui/badge'
import { Checkbox } from '#/components/ui/checkbox'
import { EditableCell } from './editable-cell'
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
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    enablePinning: false,
    size: 40,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    size: 180,
    cell: (context) => (
      <EditableCell context={context} field={{ type: 'text', rules: { required: true, max: 20 } }} />
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 180,
    cell: (context) => {
      const { row } = context
      return (
        <EditableCell context={context} field={{ type: 'select', options: ['A', 'B\'s'] }}>
          <Badge variant="outline">{row.original.status}</Badge>
        </EditableCell>
      )
    },
  },
  {
    accessorKey: 'budget',
    header: 'Budget',
    size: 140,
    cell: (context) => {
      const { row } = context
      return (
        <EditableCell context={context} field={{ type: 'number', rules: { min: 0, integer: true } }}>
          <span className="tabular-nums">
            {row.original.budget.toLocaleString('en-US')}
          </span>
        </EditableCell>
      )
    },
    meta: { align: 'right' },
  },
  {
    accessorKey: 'due',
    header: 'Due',
    size: 140,
    cell: (context) => {
      const { row } = context
      return (
        <EditableCell context={context} field={{ type: 'date' }}>
          <span className="tabular-nums">
            {dateFormat.format(new Date(`${row.original.due}T00:00:00Z`))}
          </span>
        </EditableCell>
      )
    },
  },
  {
    accessorKey: 'done',
    header: 'Done',
    size: 100,
    cell: (context) => (
      <EditableCell context={context} field={{ type: 'checkbox' }} />
    ),
  },
  {
    accessorKey: 'note',
    header: 'Note',
    size: 180,
  },
  {
    id: 'actions',
    enableSorting: false,
    enableHiding: false,
    enablePinning: false,
    size: 56,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row, table }) => (
      <RowActions
        row={row}
        table={table}
        actions={['copy', 'duplicate', 'delete']}
      />
    ),
  },
]
