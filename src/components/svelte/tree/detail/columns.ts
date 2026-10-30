import { createRawSnippet } from 'svelte'
import type { ColumnDef } from '@tanstack/table-core'
import {
  renderComponent,
  renderSnippet,
} from '$lib/components/ui/data-table/index.js'
import AmountCell from './AmountCell.svelte'
import DateCell from './DateCell.svelte'
import DetailsCell from './DetailsCell.svelte'
import ItemCell from './ItemCell.svelte'
import OpenChevron from './OpenChevron.svelte'
import StatusBadge from './StatusBadge.svelte'
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
    cell: ({ row }) =>
      renderComponent(ItemCell, {
        item: row.original,
        depth: row.depth,
        canExpand: row.getCanExpand(),
        expanded: row.getIsExpanded(),
        onToggle: row.getToggleExpandedHandler(),
      }),
  },
  {
    id: 'details',
    header: 'Details',
    cell: ({ row }) => renderComponent(DetailsCell, { item: row.original }),
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) =>
      renderComponent(StatusBadge, { status: row.original.status }),
  },
  {
    id: 'amount',
    header: () =>
      renderSnippet(
        createRawSnippet(() => ({
          render: () => `<div class="text-right">Amount</div>`,
        })),
      ),
    cell: ({ row }) => renderComponent(AmountCell, { item: row.original }),
  },
  {
    id: 'date',
    header: 'Date',
    cell: ({ row }) => renderComponent(DateCell, { item: row.original }),
  },
  {
    id: 'open',
    header: () =>
      renderSnippet(
        createRawSnippet(() => ({
          render: () => `<span class="sr-only">Details</span>`,
        })),
      ),
    cell: ({ row }) =>
      row.original.kind === 'shipment' ? renderComponent(OpenChevron, {}) : null,
    size: 32,
  },
]
