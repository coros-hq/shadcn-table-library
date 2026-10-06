import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ChevronRight } from '@lucide/vue'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
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
      return h(
        'div',
        {
          class: 'flex items-center gap-1.5',
          style: { paddingLeft: `${row.depth * 1.5}rem` },
        },
        [
          row.getCanExpand()
            ? h(
                'button',
                {
                  type: 'button',
                  onClick: row.getToggleExpandedHandler(),
                  class:
                    'flex size-4 shrink-0 items-center justify-center text-muted-foreground',
                  'aria-label': `${row.getIsExpanded() ? 'Collapse' : 'Expand'} order`,
                },
                h(ChevronRight, {
                  class: cn(
                    'size-3.5 transition-transform',
                    row.getIsExpanded() && 'rotate-90',
                  ),
                }),
              )
            : h('span', { class: 'w-4 shrink-0' }),
          item.kind === 'order'
            ? h('span', { class: 'font-medium' }, `Order ${item.number}`)
            : h('span', [
                `${item.carrier} `,
                h(
                  'span',
                  { class: 'font-mono text-xs text-muted-foreground' },
                  `${item.tracking.slice(0, 10)}…`,
                ),
              ]),
        ],
      )
    },
  },
  {
    id: 'details',
    header: 'Details',
    cell: ({ row }) => {
      const item = row.original
      return item.kind === 'order'
        ? h('div', [
            h('div', item.customer),
            h('div', { class: 'text-xs text-muted-foreground' }, item.email),
          ])
        : h('span', { class: 'text-muted-foreground' }, item.destination)
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        Badge,
        { variant: 'secondary', class: statusStyle[row.original.status] },
        () => row.original.status,
      ),
  },
  {
    id: 'amount',
    header: () => h('div', { class: 'text-right' }, 'Amount'),
    cell: ({ row }) => {
      const item = row.original
      return h(
        'div',
        { class: 'text-right tabular-nums' },
        item.kind === 'order'
          ? money.format(item.total)
          : h(
              'span',
              { class: 'text-muted-foreground' },
              `${item.items} ${item.items === 1 ? 'item' : 'items'}`,
            ),
      )
    },
  },
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const item = row.original
      return h(
        'span',
        { class: 'whitespace-nowrap text-muted-foreground' },
        item.kind === 'order'
          ? day.format(new Date(item.placedAt))
          : `ETA ${day.format(new Date(item.eta))}`,
      )
    },
  },
  {
    id: 'open',
    header: () => h('span', { class: 'sr-only' }, 'Details'),
    cell: ({ row }) =>
      row.original.kind === 'shipment'
        ? h(ChevronRight, {
            'aria-hidden': 'true',
            class: 'ml-auto size-4 text-muted-foreground',
          })
        : null,
    size: 32,
  },
]
