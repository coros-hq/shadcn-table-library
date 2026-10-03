import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/ui/badge'

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
      h(
        Badge,
        { variant: statusVariant[row.original.status] },
        () => row.original.status,
      ),
  },
  { accessorKey: 'total', header: 'Total' },
]
