'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils.ts'
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
    cell: ({ row }) => {
      const rule = matchRule(row.original, stockRules)
      return (
        <div
          className={cn(
            'flex items-center gap-1.5 rounded px-2 py-1 tabular-nums',
            rule?.className,
          )}
        >
          {rule ? <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> : null}
          <span>{row.original.stock}</span>
          <span className="text-xs text-muted-foreground">
            / {row.original.reorderPoint} reorder pt.
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'marginPct',
    header: 'Margin',
    cell: ({ row }) => {
      const rule = matchRule(row.original, marginRules)
      return (
        <span className={cn('tabular-nums', rule?.className)}>
          {row.original.marginPct.toFixed(1)}%
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const rule = matchRule(row.original, statusRules)
      return (
        <Badge variant="outline" className={cn('border-transparent', rule?.className)}>
          {row.original.status}
        </Badge>
      )
    },
  },
]
