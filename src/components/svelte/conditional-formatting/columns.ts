import type { ColumnDef } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import MarginCell from './MarginCell.svelte'
import StatusBadge from './StatusBadge.svelte'
import StockCell from './StockCell.svelte'
import type { FormatRule } from './rules'
import { matchRule } from './rules'

export type InventoryItem = {
  id: string
  product: string
  sku: string
  stock: number
  reorderPoint: number
  marginPct: number
  status: 'In Stock' | 'Low Stock' | 'Backordered' | 'Discontinued'
}

// Most specific condition first — "out of stock" would also satisfy
// "below reorder point", so it has to be checked first to win.
const stockRules: FormatRule<InventoryItem>[] = [
  {
    test: (row) => row.stock === 0,
    className:
      'bg-destructive/15 text-destructive dark:bg-destructive/25 dark:text-red-300 font-medium',
    label: 'Out of stock',
  },
  {
    test: (row) => row.stock < row.reorderPoint,
    className:
      'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 font-medium',
    label: 'Below reorder point',
  },
]

const marginRules: FormatRule<InventoryItem>[] = [
  { test: (row) => row.marginPct < 10, className: 'text-rose-600 dark:text-rose-400 font-medium' },
  { test: (row) => row.marginPct >= 30, className: 'text-emerald-600 dark:text-emerald-400 font-medium' },
]

const statusRules: FormatRule<InventoryItem>[] = [
  {
    test: (row) => row.status === 'Discontinued',
    className: 'bg-muted text-muted-foreground line-through',
  },
  {
    test: (row) => row.status === 'Backordered' || row.status === 'Low Stock',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  },
  {
    test: (row) => row.status === 'In Stock',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
]

export const columns: ColumnDef<InventoryItem>[] = [
  { accessorKey: 'product', header: 'Product' },
  { accessorKey: 'sku', header: 'SKU' },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) =>
      renderComponent(StockCell, {
        stock: row.original.stock,
        reorderPoint: row.original.reorderPoint,
        className: matchRule(row.original, stockRules)?.className,
      }),
  },
  {
    accessorKey: 'marginPct',
    header: 'Margin',
    cell: ({ row }) =>
      renderComponent(MarginCell, {
        marginPct: row.original.marginPct,
        className: matchRule(row.original, marginRules)?.className,
      }),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      renderComponent(StatusBadge, {
        status: row.original.status,
        className: matchRule(row.original, statusRules)?.className,
      }),
  },
]
