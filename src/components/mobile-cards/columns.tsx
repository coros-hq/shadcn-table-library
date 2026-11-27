'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '#/components/ui/badge'

export type Order = {
  id: string
  customer: string
  date: string
  status: 'Paid' | 'Pending' | 'Refunded'
  total: string
}

// Soft status pills: one hue per meaning, never the solid default badge
const statusStyle: Record<Order['status'], string> = {
  Paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  Pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  Refunded: 'bg-muted text-muted-foreground',
}

export const columns: ColumnDef<Order>[] = [
  { accessorKey: 'id', header: 'Order' },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'date', header: 'Date' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant="secondary" className={statusStyle[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: 'total', header: 'Total' },
]
