'use client'

import type { ColumnDef } from '@tanstack/react-table-v9'
import { Badge } from '#/components/ui/badge'
import type { V9Features } from '#/lib/table-v9-features.ts'

export type Order = {
  id: string
  customer: string
  date: string
  status: 'Paid' | 'Pending' | 'Refunded'
  total: string
}

const statusVariant: Record<Order['status'], 'default' | 'secondary' | 'outline'> = {
  Paid: 'default',
  Pending: 'secondary',
  Refunded: 'outline',
}

export const columns: ColumnDef<V9Features, Order>[] = [
  { accessorKey: 'id', header: 'Order' },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'date', header: 'Date' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: 'total', header: 'Total' },
]
