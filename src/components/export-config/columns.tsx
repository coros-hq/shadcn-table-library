'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '#/components/ui/badge'

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

const statusVariant: Record<
  Order['status'],
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  Paid: 'default',
  Pending: 'secondary',
  Refunded: 'outline',
  Failed: 'destructive',
}

export const columns: ColumnDef<Order>[] = [
  { accessorKey: 'id', header: 'Order' },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'region', header: 'Region' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>
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
