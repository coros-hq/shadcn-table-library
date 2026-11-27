import { renderComponent, type ColumnDef } from '@tanstack/svelte-table'
import type { V9Features } from '$lib/table-v9-features'
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
      'bg-red-500/10 text-red-700 dark:text-red-400 font-medium',
    label: 'Out of stock',
  },
  {
    test: (row) => row.stock < row.reorderPoint,
    className:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium',
    label: 'Below reorder point',
  },
]

const marginRules: FormatRule<InventoryItem>[] = [
  {
    test: (row) => row.marginPct < 10,
    className: 'text-rose-600 dark:text-rose-400 font-medium',
  },
  {
    test: (row) => row.marginPct >= 30,
    className: 'text-emerald-600 dark:text-emerald-400 font-medium',
  },
]

const statusRules: FormatRule<InventoryItem>[] = [
  {
    test: (row) => row.status === 'Discontinued',
    className: 'bg-muted text-muted-foreground line-through',
  },
  {
    test: (row) => row.status === 'Backordered' || row.status === 'Low Stock',
    className:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  {
    test: (row) => row.status === 'In Stock',
    className:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
]

export const columns: ColumnDef<V9Features, InventoryItem>[] = [
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
