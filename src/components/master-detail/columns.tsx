'use client'

import type { ColumnDef } from '@tanstack/react-table'

export type OrderItem = {
  product: string
  qty: number
  price: number
}

export type Order = {
  id: string
  customer: string
  date: string
  status: string
  total: number
  shippingAddress: string
  items: OrderItem[]
}

export const currency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

// One hue per meaning, and the label always carries the status too
const statusStyle: Record<string, string> = {
  Delivered: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  Processing: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  Cancelled: 'bg-muted text-muted-foreground',
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[status] ?? 'bg-muted text-muted-foreground'}`}
    >
      {status}
    </span>
  )
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'id',
    header: 'Order',
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
  },
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusPill status={row.original.status} />,
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ getValue }) => currency(getValue() as number),
  },
]
