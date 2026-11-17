import { ChevronRight } from 'lucide-react'
import type { ColumnDef, Table } from '@tanstack/react-table'

import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import { fields } from './data'
import type { CatalogRow } from './data'
import { changedFields, formatValue, inView, keysOf, rowState } from './diff'
import type { Decisions, View } from './diff'

export interface ReviewMeta {
  decisions: Decisions
  /** Opens the diff panel for a product with changes */
  open: (id: string) => void
}

const getMeta = (table: Table<CatalogRow>) =>
  table.options.meta as unknown as ReviewMeta

/** Products without changes only show up under "All" */
export const rowInView = (row: CatalogRow, decisions: Decisions, view: View) =>
  row.change ? inView(rowState(row.change, decisions), view) : view === 'all'

function ReviewBadge({
  row,
  decisions,
}: {
  row: CatalogRow
  decisions: Decisions
}) {
  if (!row.change) return null
  const state = rowState(row.change, decisions)
  const keys = keysOf(row.change)
  const label =
    state === 'accepted'
      ? 'Accepted'
      : state === 'rejected'
        ? 'Rejected'
        : state === 'mixed'
          ? 'Partly accepted'
          : row.change.kind === 'create'
            ? 'New product'
            : row.change.kind === 'delete'
              ? 'Removal'
              : `${keys.length} change${keys.length === 1 ? '' : 's'}`
  return (
    <Badge
      variant="outline"
      className={cn(
        state === 'pending' || state === 'partial'
          ? 'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300'
          : state === 'accepted'
            ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
            : 'text-muted-foreground',
      )}
    >
      {label}
    </Badge>
  )
}

export const columns: ColumnDef<CatalogRow>[] = [
  {
    id: 'product',
    header: 'Product',
    accessorFn: (row) => row.product.name,
    filterFn: (row, _id, filter: { view: View; decisions: Decisions }) =>
      rowInView(row.original, filter.decisions, filter.view),
    cell: ({ row, table }) => {
      const { product, change } = row.original
      const name = (
        <span className="flex items-center gap-2 font-medium">
          {product.name}
          {change?.kind === 'update' &&
          changedFields(change).includes('name') ? (
            <span
              title="Changes in this update"
              className="size-1.5 shrink-0 rounded-full bg-amber-500"
            />
          ) : null}
          {change?.kind === 'create' ? (
            <span className="text-xs font-normal text-emerald-700 dark:text-emerald-400">
              new
            </span>
          ) : null}
        </span>
      )
      return (
        <div className="flex min-w-36 flex-col gap-0.5">
          {change ? (
            // A real button, so the panel opens from the keyboard too
            <button
              type="button"
              data-review-id={row.id}
              onClick={(e) => {
                e.stopPropagation()
                getMeta(table).open(row.id)
              }}
              className="rounded-sm text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              aria-label={`Review changes to ${product.name}`}
            >
              {name}
            </button>
          ) : (
            name
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {product.sku}
          </span>
        </div>
      )
    },
  },
  ...fields
    .filter((f) => f.id !== 'name')
    .map((field): ColumnDef<CatalogRow> => ({
      id: field.id,
      header: () => (
        <span className={cn(field.numeric && 'block text-right')}>
          {field.label}
        </span>
      ),
      cell: ({ row }) => {
        const { product, change } = row.original
        const changing =
          change?.kind === 'update' && changedFields(change).includes(field.id)
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1.5',
              field.numeric && 'w-full justify-end tabular-nums',
              change?.kind === 'delete' && 'text-muted-foreground line-through',
            )}
          >
            {formatValue(field.id, product[field.id])}
            {changing ? (
              // Marks the values the update would change
              <span
                title="Changes in this update"
                className="size-1.5 shrink-0 rounded-full bg-amber-500"
              />
            ) : null}
          </span>
        )
      },
    })),
  {
    id: 'review',
    header: () => <span className="sr-only">Review</span>,
    cell: ({ row, table }) => (
      <div className="flex items-center justify-end gap-1">
        <ReviewBadge row={row.original} decisions={getMeta(table).decisions} />
        {row.original.change ? (
          <ChevronRight className="size-4 text-muted-foreground" />
        ) : null}
      </div>
    ),
  },
]
