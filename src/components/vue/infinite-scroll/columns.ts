import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Transaction, TransactionStatus } from './data'

const statusStyle: Record<TransactionStatus, string> = {
  paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  refunded: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  failed: 'bg-red-500/10 text-red-700 dark:text-red-400',
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const date = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'id',
    header: 'Transaction',
    cell: ({ row }) =>
      h('span', { class: 'font-mono text-xs' }, row.original.id),
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) =>
      h('div', [
        h('div', { class: 'font-medium' }, row.original.customer),
        h('div', { class: 'text-xs text-muted-foreground' }, row.original.email),
      ]),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        Badge,
        {
          variant: 'secondary',
          class: cn('capitalize', statusStyle[row.original.status]),
        },
        () => row.original.status,
      ),
  },
  {
    accessorKey: 'amount',
    header: () => h('div', { class: 'text-right' }, 'Amount'),
    cell: ({ row }) =>
      h('div', { class: 'text-right tabular-nums' }, money.format(row.original.amount)),
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-muted-foreground' },
        date.format(new Date(row.original.createdAt)),
      ),
  },
]
