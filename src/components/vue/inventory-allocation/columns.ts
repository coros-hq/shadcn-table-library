import { h } from 'vue'
import type { ColumnDef, Table } from '@tanstack/vue-table'
import { ChevronRight } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import EditableNumberCell from './EditableNumberCell.vue'
import type { SkuMetrics, StockStatus } from './formulas'
import { deriveMetrics } from './formulas'

export type Batch = {
  id: string
  lot: string
  location: string
  /** ISO date (yyyy-mm-dd) */
  expiresOn: string
  onHand: number
  allocated: number
}

export type SkuRow = {
  sku: string
  name: string
  casePack: number
  /** Units on open orders waiting to be allocated from stock. */
  orderedQty: number
  dailyDemand: number
  leadTimeDays: number
  safetyStock: number
  batches: Batch[]
}

export type EditableSkuField = 'dailyDemand' | 'leadTimeDays' | 'safetyStock'

/**
 * Handed to the table through `meta` so static column definitions can write
 * back to state without closing over it — the columns array never has to be
 * rebuilt when data changes.
 */
export interface InventoryTableMeta {
  updateSku: (sku: string, field: EditableSkuField, value: number) => void
  updateBatch: (sku: string, batchId: string, allocated: number) => void
  autoAllocate: (sku: string) => void
}

export function getMeta(table: Table<SkuRow>) {
  return table.options.meta as InventoryTableMeta
}

const statusStyles: Record<StockStatus, string> = {
  Short: 'bg-destructive/15 text-destructive dark:bg-destructive/25 dark:text-red-300',
  Reorder: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  Healthy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
}

// Footers sum the same derived metrics the cells render, so a total can
// never disagree with the rows above it.
function sumFooter(table: Table<SkuRow>, pick: (m: SkuMetrics) => number) {
  const total = table
    .getRowModel()
    .rows.reduce((sum, r) => sum + pick(deriveMetrics(r.original)), 0)
  return h('span', { class: 'tabular-nums' }, total.toLocaleString())
}

const statusRank: Record<StockStatus, number> = { Short: 0, Reorder: 1, Healthy: 2 }

function editableColumn(
  field: EditableSkuField,
  header: string,
  suffix?: string,
): ColumnDef<SkuRow> {
  return {
    accessorKey: field,
    header,
    cell: ({ row, table }) =>
      h(EditableNumberCell, {
        label: `${header} for ${row.original.sku}`,
        value: row.original[field],
        suffix,
        validate: (n: number) =>
          field === 'leadTimeDays' && n === 0 ? 'Must be at least 1' : null,
        onCommit: (n: number) => getMeta(table).updateSku(row.original.sku, field, n),
      }),
  }
}

export const columns: ColumnDef<SkuRow>[] = [
  {
    id: 'expander',
    header: () => h('span', { class: 'sr-only' }, 'Batches'),
    enableSorting: false,
    cell: ({ row }) =>
      h(
        'button',
        {
          type: 'button',
          onClick: row.getToggleExpandedHandler(),
          'aria-label': row.getIsExpanded() ? 'Hide batches' : 'Show batches',
          'aria-expanded': row.getIsExpanded(),
          class:
            'flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground',
        },
        h(ChevronRight, {
          class: cn('size-3.5 transition-transform', row.getIsExpanded() && 'rotate-90'),
        }),
      ),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) =>
      h('div', { class: 'min-w-40' }, [
        h('p', { class: 'font-medium' }, row.original.name),
        h(
          'p',
          { class: 'font-mono text-xs text-muted-foreground' },
          `${row.original.sku} · ${row.original.batches.length} ${
            row.original.batches.length === 1 ? 'batch' : 'batches'
          }`,
        ),
      ]),
    footer: () => h('span', 'Totals'),
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: (row) => statusRank[deriveMetrics(row).status],
    cell: ({ row }) => {
      const { status } = deriveMetrics(row.original)
      return h(
        Badge,
        { variant: 'outline', class: cn('border-transparent', statusStyles[status]) },
        () => status,
      )
    },
  },
  {
    id: 'available',
    header: 'Available',
    accessorFn: (row) => deriveMetrics(row).available,
    cell: ({ row }) => {
      const { available, onHand } = deriveMetrics(row.original)
      return h('div', { class: 'tabular-nums' }, [
        h('p', available.toLocaleString()),
        h('p', { class: 'text-xs text-muted-foreground' }, `of ${onHand.toLocaleString()} on hand`),
      ])
    },
    footer: ({ table }) => sumFooter(table, (m) => m.available),
  },
  {
    id: 'allocation',
    header: 'Allocated',
    accessorFn: (row) => {
      const { allocated } = deriveMetrics(row)
      return row.orderedQty ? allocated / row.orderedQty : 1
    },
    cell: ({ row }) => {
      const { allocated, unallocated } = deriveMetrics(row.original)
      const pct = row.original.orderedQty
        ? Math.min(100, (allocated / row.original.orderedQty) * 100)
        : 100
      return h('div', { class: 'w-32 space-y-1.5 tabular-nums' }, [
        h('p', { class: 'text-xs' }, [
          `${allocated.toLocaleString()} / ${row.original.orderedQty.toLocaleString()}`,
          unallocated > 0
            ? h('span', { class: 'text-muted-foreground' }, ` · ${unallocated} open`)
            : null,
        ]),
        h('div', { class: 'h-1.5 overflow-hidden rounded-full bg-muted' }, [
          h('div', {
            class: cn('h-full rounded-full', unallocated > 0 ? 'bg-amber-500' : 'bg-emerald-500'),
            style: { width: `${pct}%` },
          }),
        ]),
      ])
    },
  },
  editableColumn('dailyDemand', 'Daily demand', '/day'),
  editableColumn('leadTimeDays', 'Lead time', 'd'),
  editableColumn('safetyStock', 'Safety stock'),
  {
    id: 'reorderPoint',
    header: 'Reorder point',
    accessorFn: (row) => deriveMetrics(row).reorderPoint,
    cell: ({ row }) => {
      const { reorderPoint, daysOfCover } = deriveMetrics(row.original)
      return h('div', { class: 'tabular-nums' }, [
        h('p', reorderPoint.toLocaleString()),
        h(
          'p',
          {
            class: cn(
              'text-xs',
              daysOfCover < row.original.leadTimeDays
                ? 'text-destructive'
                : 'text-muted-foreground',
            ),
          },
          Number.isFinite(daysOfCover) ? `${daysOfCover.toFixed(1)}d cover` : 'no demand',
        ),
      ])
    },
  },
  {
    id: 'reorderQty',
    header: 'Suggested PO',
    accessorFn: (row) => deriveMetrics(row).reorderQty,
    cell: ({ row }) => {
      const { reorderQty } = deriveMetrics(row.original)
      if (reorderQty === 0) return h('span', { class: 'text-muted-foreground' }, '—')
      return h('div', { class: 'tabular-nums' }, [
        h('p', { class: 'font-medium' }, reorderQty.toLocaleString()),
        h(
          'p',
          { class: 'text-xs text-muted-foreground' },
          `${reorderQty / row.original.casePack} × ${row.original.casePack}/case`,
        ),
      ])
    },
    footer: ({ table }) => sumFooter(table, (m) => m.reorderQty),
  },
]
