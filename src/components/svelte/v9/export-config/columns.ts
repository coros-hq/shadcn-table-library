import { renderComponent, type ColumnDef } from '@tanstack/svelte-table'
import type { V9Features } from '$lib/table-v9-features'
import AmountCell from './AmountCell.svelte'
import StatusBadge from './StatusBadge.svelte'

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

export const columns: ColumnDef<V9Features, Order>[] = [
  { accessorKey: 'id', header: 'Order' },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'region', header: 'Region' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      renderComponent(StatusBadge, { status: row.original.status }),
  },
  { accessorKey: 'date', header: 'Date' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) =>
      renderComponent(AmountCell, { amount: row.original.amount }),
  },
]
