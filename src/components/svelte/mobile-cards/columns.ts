import type { ColumnDef } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import StatusBadge from './StatusBadge.svelte'

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

export const columns: ColumnDef<Order>[] = [
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
