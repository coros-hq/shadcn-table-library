'use client'

import type { ColumnDef } from '@tanstack/react-table'
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
    header: 'Name',
    size: 180,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    size: 180,
  },
  {
    accessorKey: 'department',
    header: 'Department',
    size: 180,
    cell: ({ row }) => <Badge variant="outline">{row.original.department}</Badge>,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    size: 180,
  },
  {
    accessorKey: 'location',
    header: 'Location',
    size: 180,
  },
  {
    accessorKey: 'manager',
    header: 'Manager',
    size: 180,
  },
  {
    accessorKey: 'start_date',
    header: 'Start date',
    size: 140,
    cell: ({ row }) => (
      <span className="tabular-nums">
        {dateFormat.format(new Date(`${row.original.start_date}T00:00:00Z`))}
      </span>
    ),
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 140,
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.salary.toLocaleString('en-US')}
      </span>
    ),
    meta: { align: 'right' },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 180,
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
]
