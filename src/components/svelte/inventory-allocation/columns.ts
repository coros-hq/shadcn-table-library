import { createRawSnippet } from 'svelte'
import type { ColumnDef, Table } from '@tanstack/table-core'
import {
  renderComponent,
  renderSnippet,
} from '$lib/components/ui/data-table/index.js'
import AllocationCell from './AllocationCell.svelte'
import EditableNumberCell from './EditableNumberCell.svelte'
import ExpanderCell from './ExpanderCell.svelte'
import SkuCell from './SkuCell.svelte'
import StackedCell from './StackedCell.svelte'
import StatusBadge from './StatusBadge.svelte'
import TabularText from './TabularText.svelte'
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

// Footers sum the same derived metrics the cells render, so a total can
// never disagree with the rows above it.
function sumFooter(table: Table<SkuRow>, pick: (m: SkuMetrics) => number) {
  const total = table
    .getRowModel()
    .rows.reduce((sum, r) => sum + pick(deriveMetrics(r.original)), 0)
  return renderComponent(TabularText, { text: total.toLocaleString() })
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
      renderComponent(EditableNumberCell, {
        label: `${header} for ${row.original.sku}`,
        value: row.original[field],
        suffix,
        validate: (n: number) =>
          field === 'leadTimeDays' && n === 0 ? 'Must be at least 1' : null,
        oncommit: (n: number) => getMeta(table).updateSku(row.original.sku, field, n),
      }),
  }
}

export const columns: ColumnDef<SkuRow>[] = [
  {
    id: 'expander',
    header: () =>
      renderSnippet(
        createRawSnippet(() => ({
          render: () => `<span class="sr-only">Batches</span>`,
        })),
      ),
    enableSorting: false,
    cell: ({ row }) =>
      renderComponent(ExpanderCell, {
        expanded: row.getIsExpanded(),
        ontoggle: row.getToggleExpandedHandler(),
      }),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) =>
      renderComponent(SkuCell, {
        name: row.original.name,
        sku: row.original.sku,
        batchCount: row.original.batches.length,
      }),
    footer: () => 'Totals',
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: (row) => statusRank[deriveMetrics(row).status],
    cell: ({ row }) =>
      renderComponent(StatusBadge, { status: deriveMetrics(row.original).status }),
  },
  {
    id: 'available',
    header: 'Available',
    accessorFn: (row) => deriveMetrics(row).available,
    cell: ({ row }) => {
      const { available, onHand } = deriveMetrics(row.original)
      return renderComponent(StackedCell, {
        primary: available.toLocaleString(),
        secondary: `of ${onHand.toLocaleString()} on hand`,
      })
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
      return renderComponent(AllocationCell, {
        allocated,
        orderedQty: row.original.orderedQty,
        unallocated,
      })
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
      return renderComponent(StackedCell, {
        primary: reorderPoint.toLocaleString(),
        secondary: Number.isFinite(daysOfCover)
          ? `${daysOfCover.toFixed(1)}d cover`
          : 'no demand',
        secondaryClass:
          daysOfCover < row.original.leadTimeDays ? 'text-destructive' : undefined,
      })
    },
  },
  {
    id: 'reorderQty',
    header: 'Suggested PO',
    accessorFn: (row) => deriveMetrics(row).reorderQty,
    cell: ({ row }) => {
      const { reorderQty } = deriveMetrics(row.original)
      if (reorderQty === 0)
        return renderComponent(TabularText, { text: '—', muted: true })
      return renderComponent(StackedCell, {
        primary: reorderQty.toLocaleString(),
        primaryClass: 'font-medium',
        secondary: `${reorderQty / row.original.casePack} × ${row.original.casePack}/case`,
      })
    },
    footer: ({ table }) => sumFooter(table, (m) => m.reorderQty),
  },
]
