'use client'

import type { ColumnDef } from '@tanstack/react-table-v9'
import { Badge } from '#/components/ui/badge'
import type { V9Features } from '#/lib/table-v9-features.ts'

export const statuses = ['Paid', 'Pending', 'Refunded', 'Failed'] as const
export const regions = ['NA', 'EU', 'APAC', 'LATAM'] as const

export type Order = {
  id: string
  customer: string
  region: (typeof regions)[number]
  status: (typeof statuses)[number]
  date: string // ISO yyyy-mm-dd
  amount: number
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

// Soft status pills: one hue per meaning, never the solid default badge
const statusStyle: Record<Order['status'], string> = {
  Paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  Pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  Refunded: 'bg-muted text-muted-foreground',
  Failed: 'bg-red-500/10 text-red-700 dark:text-red-400',
}

export const columns: ColumnDef<V9Features, Order>[] = [
  { accessorKey: 'id', header: 'Order' },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'region', header: 'Region' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant="secondary" className={statusStyle[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: 'date', header: 'Date' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className="tabular-nums">{usd.format(row.original.amount)}</span>
    ),
  },
]
