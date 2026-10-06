import type { ColumnDef } from '@tanstack/react-table-v9'
import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils.ts'
import type { V9Features } from '#/lib/table-v9-features.ts'
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

export const columns: ColumnDef<V9Features, Transaction>[] = [
  {
    accessorKey: 'id',
    header: 'Transaction',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.id}</span>
    ),
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.customer}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant="secondary"
        className={cn('capitalize', statusStyle[row.original.status])}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {money.format(row.original.amount)}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {date.format(new Date(row.original.createdAt))}
      </span>
    ),
  },
]
