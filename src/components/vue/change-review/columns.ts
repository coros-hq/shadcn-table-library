import { h } from 'vue'
import type { ColumnDef, Table } from '@tanstack/vue-table'
import { ChevronRight } from '@lucide/vue'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { fields } from './data'
import type { CatalogRow, FieldId } from './data'
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

/** Marks the values the update would change */
const dot = () =>
  h('span', {
    title: 'Changes in this update',
    class: 'size-1.5 shrink-0 rounded-full bg-amber-500',
  })

const changes = (row: CatalogRow, field: FieldId) =>
  row.change?.kind === 'update' && changedFields(row.change).includes(field)

function reviewBadge(row: CatalogRow, decisions: Decisions) {
  if (!row.change) return null
  const state = rowState(row.change, decisions)
  const n = keysOf(row.change).length
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
              : `${n} change${n === 1 ? '' : 's'}`
  return h(
    Badge,
    {
      variant: 'outline',
      class:
        state === 'pending' || state === 'partial'
          ? 'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300'
          : state === 'accepted'
            ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
            : 'text-muted-foreground',
    },
    () => label,
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
      const name = h('span', { class: 'flex items-center gap-2 font-medium' }, [
        product.name,
        changes(row.original, 'name') ? dot() : null,
        change?.kind === 'create'
          ? h(
              'span',
              {
                class:
                  'text-xs font-normal text-emerald-700 dark:text-emerald-400',
              },
              'new',
            )
          : null,
      ])
      return h('div', { class: 'flex min-w-36 flex-col gap-0.5' }, [
        change
          ? // A real button, so the panel opens from the keyboard too
            h(
              'button',
              {
                type: 'button',
                'data-review-id': row.id,
                class:
                  'rounded-sm text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                'aria-label': `Review changes to ${product.name}`,
                onClick: (e: MouseEvent) => {
                  e.stopPropagation()
                  getMeta(table).open(row.id)
                },
              },
              [name],
            )
          : name,
        h(
          'span',
          { class: 'font-mono text-xs text-muted-foreground' },
          product.sku,
        ),
      ])
    },
  },
  ...fields
    .filter((f) => f.id !== 'name')
    .map((field): ColumnDef<CatalogRow> => ({
      id: field.id,
      header: () =>
        h(
          'span',
          { class: cn(field.numeric && 'block text-right') },
          field.label,
        ),
      cell: ({ row }) =>
        h(
          'span',
          {
            class: cn(
              'inline-flex items-center gap-1.5',
              field.numeric && 'w-full justify-end tabular-nums',
              row.original.change?.kind === 'delete' &&
                'text-muted-foreground line-through',
            ),
          },
          [
            formatValue(field.id, row.original.product[field.id]),
            changes(row.original, field.id) ? dot() : null,
          ],
        ),
    })),
  {
    id: 'review',
    header: () => h('span', { class: 'sr-only' }, 'Review'),
    cell: ({ row, table }) =>
      h('div', { class: 'flex items-center justify-end gap-1' }, [
        reviewBadge(row.original, getMeta(table).decisions),
        row.original.change
          ? h(ChevronRight, { class: 'size-4 text-muted-foreground' })
          : null,
      ]),
  },
]
