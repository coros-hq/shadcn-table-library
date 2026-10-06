'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils.ts'
import type { OrderStatus, ShipmentStatus, TreeRow } from './data'

export const statusStyle: Record<OrderStatus | ShipmentStatus, string> = {
  Processing: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  Shipped: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  Delivered: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  'Label created': 'bg-muted text-muted-foreground',
  'In transit': 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  'Out for delivery': 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
}

export const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export const day = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})

export const columns: ColumnDef<TreeRow>[] = [
  {
    id: 'item',
    header: 'Item',
    cell: ({ row }) => {
      const item = row.original
      return (
        <div
          className="flex items-center gap-1.5"
          style={{ paddingLeft: `${row.depth * 1.5}rem` }}
        >
          {row.getCanExpand() ? (
            <button
              type="button"
              onClick={row.getToggleExpandedHandler()}
              className="flex size-4 shrink-0 items-center justify-center text-muted-foreground"
              aria-label={`${row.getIsExpanded() ? 'Collapse' : 'Expand'} order`}
            >
              <ChevronRight
                className={cn(
                  'size-3.5 transition-transform',
                  row.getIsExpanded() && 'rotate-90',
                )}
              />
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}
          {item.kind === 'order' ? (
            <span className="font-medium">Order {item.number}</span>
          ) : (
            <span>
              {item.carrier}{' '}
              <span className="font-mono text-xs text-muted-foreground">
                {item.tracking.slice(0, 10)}…
              </span>
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: 'details',
    header: 'Details',
    cell: ({ row }) => {
      const item = row.original
      return item.kind === 'order' ? (
        <div>
          <div>{item.customer}</div>
          <div className="text-xs text-muted-foreground">{item.email}</div>
        </div>
      ) : (
        <span className="text-muted-foreground">{item.destination}</span>
      )
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant="secondary" className={statusStyle[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="text-right tabular-nums">
          {item.kind === 'order' ? (
            money.format(item.total)
          ) : (
            <span className="text-muted-foreground">
              {item.items} {item.items === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const item = row.original
      return (
        <span className="whitespace-nowrap text-muted-foreground">
          {item.kind === 'order'
            ? day.format(new Date(item.placedAt))
            : `ETA ${day.format(new Date(item.eta))}`}
        </span>
      )
    },
  },
  {
    id: 'open',
    header: () => <span className="sr-only">Details</span>,
    cell: ({ row }) =>
      row.original.kind === 'shipment' ? (
        <ChevronRight
          aria-hidden
          className="ml-auto size-4 text-muted-foreground"
        />
      ) : null,
    size: 32,
  },
]
