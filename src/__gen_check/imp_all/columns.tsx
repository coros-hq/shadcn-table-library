'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '#/components/ui/badge'
import { Checkbox } from '#/components/ui/checkbox'
import { EditableCell } from './editable-cell'
import type { FacetDef, Field, Preset } from './filters'
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
    header: 'name',
    size: 180,
    cell: (context) => (
      <EditableCell context={context} field={{ type: 'text' }} />
    ),
  },
  {
    accessorKey: 'plan',
    header: 'plan',
    size: 180,
    cell: (context) => {
      const { row } = context
      return (
        <EditableCell context={context} field={{ type: 'select', options: ['Pro', 'Free'] }}>
          <Badge variant="outline">{row.original.plan}</Badge>
        </EditableCell>
      )
    },
  },
  {
    accessorKey: 'seats',
    header: 'seats',
    size: 140,
    cell: (context) => {
      const { row } = context
      return (
        <EditableCell context={context} field={{ type: 'number' }}>
          <span className="tabular-nums">
            {row.original.seats?.toLocaleString('en-US')}
          </span>
        </EditableCell>
      )
    },
    meta: { align: 'right' },
  },
  {
    accessorKey: 'renews',
    header: 'renews',
    size: 140,
    cell: (context) => {
      const { row } = context
      return (
        <EditableCell context={context} field={{ type: 'date' }}>
          <span className="tabular-nums">
            {dateFormat.format(new Date(`${row.original.renews}T00:00:00Z`))}
          </span>
        </EditableCell>
      )
    },
  },
  {
    accessorKey: 'active',
    header: 'active',
    size: 100,
    cell: (context) => (
      <EditableCell context={context} field={{ type: 'checkbox' }} />
    ),
  },
  {
    accessorKey: 'meta',
    header: 'meta',
    size: 180,
    cell: (context) => (
      <EditableCell context={context} field={{ type: 'text' }} />
    ),
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

// What the filter bar needs to know about each column
export const fields: Field[] = [
  { id: 'name', name: 'name', type: 'text' },
  { id: 'plan', name: 'plan', type: 'select', options: ['Pro', 'Free'] },
  { id: 'seats', name: 'seats', type: 'number' },
  { id: 'renews', name: 'renews', type: 'date' },
  { id: 'active', name: 'active', type: 'checkbox' },
  { id: 'meta', name: 'meta', type: 'text' },
]

// One control per column in the toolbar
export const facets: FacetDef[] = []

// One-click shortcuts that toggle a fixed rule
export const presets: Preset[] = []
