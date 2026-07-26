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
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ getValue }) => currency(getValue() as number),
  },
]
