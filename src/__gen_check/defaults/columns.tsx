'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Check } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import type { FacetDef, Field, Preset } from './filters'
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
    header: 'Due date',
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
]

// What the filter bar needs to know about each column
export const fields: Field[] = [
  { id: 'name', name: 'Name', type: 'text' },
  { id: 'status', name: 'Status', type: 'select', options: ['Todo', 'In progress', 'Done'] },
  { id: 'budget', name: 'Budget', type: 'number' },
  { id: 'due', name: 'Due date', type: 'date' },
  { id: 'done', name: 'Done', type: 'checkbox' },
]

// One control per column in the toolbar
export const facets: FacetDef[] = [
  { fieldId: 'status', kind: 'options' },
  { fieldId: 'budget', kind: 'range' },
]

// One-click shortcuts that toggle a fixed rule
export const presets: Preset[] = []
