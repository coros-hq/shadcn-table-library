'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '#/components/ui/badge'
import { EditableCell } from './editable-cell'
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
    cell: (context) => (
      <EditableCell context={context} field={{ type: 'text', rules: { required: true, max: 20 } }} />
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
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
    cell: (context) => (
      <EditableCell context={context} field={{ type: 'checkbox' }} />
    ),
  },
  {
    accessorKey: 'note',
    header: 'Note',
  },
]
