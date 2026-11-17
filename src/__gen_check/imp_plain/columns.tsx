'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Check } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
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
    header: 'name',
  },
  {
    accessorKey: 'plan',
    header: 'plan',
    cell: ({ row }) => <Badge variant="outline">{row.original.plan}</Badge>,
  },
  {
    accessorKey: 'seats',
    header: 'seats',
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.seats?.toLocaleString('en-US')}
      </span>
    ),
    meta: { align: 'right' },
  },
  {
    accessorKey: 'renews',
    header: 'renews',
    cell: ({ row }) => (
      <span className="tabular-nums">
        {dateFormat.format(new Date(`${row.original.renews}T00:00:00Z`))}
      </span>
    ),
  },
  {
    accessorKey: 'active',
    header: 'active',
    cell: ({ row }) =>
      row.original.active ? <Check className="size-4" aria-label="Yes" /> : null,
  },
  {
    accessorKey: 'meta',
    header: 'meta',
  },
]
