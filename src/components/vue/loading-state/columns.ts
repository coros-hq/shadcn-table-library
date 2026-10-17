import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/ui/badge'
import type { Invoice } from './data'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) =>
      h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'font-medium' }, row.original.customer),
        h(
          'span',
          { class: 'text-xs text-muted-foreground' },
          row.original.email,
        ),
      ]),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        Badge,
        {
          variant:
            row.original.status === 'Overdue' ? 'destructive' : 'secondary',
        },
        () => row.original.status,
      ),
  },
  {
    accessorKey: 'amount',
    header: () => h('div', { class: 'text-right' }, 'Amount'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right tabular-nums' },
        currency.format(row.original.amount),
      ),
  },
  { accessorKey: 'dueDate', header: 'Due' },
]
