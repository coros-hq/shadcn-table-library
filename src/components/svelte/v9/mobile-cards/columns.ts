import { renderComponent, type ColumnDef } from '@tanstack/svelte-table'
import type { V9Features } from '$lib/table-v9-features'
import StatusBadge from './StatusBadge.svelte'

export type Order = {
  id: string
  customer: string
  date: string
  status: 'Paid' | 'Pending' | 'Refunded'
  total: string
}

const statusVariant: Record<
  Order['status'],
  'default' | 'secondary' | 'outline'
> = {
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
    cell: ({ row }) =>
      renderComponent(StatusBadge, {
        status: row.original.status,
        variant: statusVariant[row.original.status],
      }),
  },
  { accessorKey: 'total', header: 'Total' },
]
