'use client'

import type { ColumnDef } from '@tanstack/react-table-v9'
import {
  Backpack,
  Camera,
  Droplet,
  Headphones,
  Shirt,
  Watch,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Checkbox } from '#/components/ui/checkbox.tsx'
import { cn } from '#/lib/utils.ts'
import type { V9Features } from '#/lib/table-v9-features.ts'
import { ProductActions } from './product-actions'
import type { Product, ProductKind, StockStatus } from './data'

const icons: Record<ProductKind, LucideIcon> = {
  backpack: Backpack,
  headphones: Headphones,
  bottle: Droplet,
  watch: Watch,
  jacket: Shirt,
  camera: Camera,
}

const statusDot: Record<StockStatus, string> = {
  Ready: 'bg-emerald-500',
  Low: 'bg-amber-500',
  Backorder: 'bg-red-500',
}

const number = new Intl.NumberFormat('en-US')
const date = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

// The bracket that links variants to their parent's thumbnail: a vertical
// rule with a rounded elbow into each variant, ending on the last one.
function Connector({ isLast }: { isLast: boolean }) {
  return (
    <>
      <span
        aria-hidden
        className="absolute top-0 left-1/2 h-1/2 w-3 rounded-bl-lg border-b-2 border-l-2 border-border"
      />
      {!isLast && (
        <span
          aria-hidden
          className="absolute top-1/2 bottom-0 left-1/2 border-l-2 border-border"
        />
      )}
    </>
  )
}

export const columns: ColumnDef<V9Features, Product>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected()
            ? true
            : table.getIsSomeRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="Select all products"
      />
    ),
    cell: ({ row }) =>
      row.depth === 0 ? (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select ${row.original.name}`}
        />
      ) : null,
    size: 32,
  },
  {
    id: 'thumbnail',
    header: () => <span className="sr-only">Image</span>,
    cell: ({ row }) => {
      if (row.depth > 0) {
        const siblings = row.getParentRow()?.subRows ?? []
        return <Connector isLast={row.index === siblings.length - 1} />
      }
      const Icon = icons[row.original.kind]
      return (
        <>
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-5" />
          </div>
          {row.getIsExpanded() && (
            <span
              aria-hidden
              className="absolute top-[calc(50%+1.125rem)] bottom-0 left-1/2 border-l-2 border-border"
            />
          )}
        </>
      )
    },
    size: 48,
  },
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => (
      <span
        className={cn(
          'block max-w-44 truncate',
          row.depth > 0 && 'text-muted-foreground',
        )}
        title={row.original.name}
      >
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <button
          type="button"
          onClick={row.getToggleExpandedHandler()}
          aria-expanded={row.getIsExpanded()}
          aria-label={`${row.getIsExpanded() ? 'Hide' : 'Show'} variants of ${row.original.name}`}
          className="text-sm underline underline-offset-4 hover:text-foreground"
        >
          {row.getIsExpanded() ? 'Hide' : 'Show'} variants
        </button>
      ) : (
        <span className="font-mono text-xs">{row.original.sku}</span>
      ),
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2 whitespace-nowrap tabular-nums">
        {number.format(row.original.stock)}
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            aria-hidden
            className={cn(
              'size-1.5 rounded-full',
              statusDot[row.original.status],
            )}
          />
          {row.original.status}
        </span>
      </span>
    ),
  },
  {
    accessorKey: 'reserved',
    header: () => <div className="text-right">Reserved</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {number.format(row.original.reserved)}
      </div>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {date.format(new Date(row.original.updatedAt))}
      </span>
    ),
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) =>
      row.depth === 0 ? <ProductActions name={row.original.name} /> : null,
    size: 72,
  },
]
