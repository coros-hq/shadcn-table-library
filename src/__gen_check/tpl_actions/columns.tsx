'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '#/components/ui/badge'
import { RowActions } from './row-actions'
import type { Row } from './data'

export const columns: ColumnDef<Row>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'kind',
    header: 'Kind',
    cell: ({ row }) => <Badge variant="outline">{row.original.kind}</Badge>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
  {
    accessorKey: 'last_synced',
    header: 'Minutes since sync',
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.last_synced.toLocaleString('en-US')}
      </span>
    ),
    meta: { align: 'right' },
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
        actions={['copy', 'duplicate', 'delete']}
      />
    ),
  },
]
