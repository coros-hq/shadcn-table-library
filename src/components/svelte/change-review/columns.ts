import type { ColumnDef, Table } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import { fields } from './data'
import type { CatalogRow } from './data'
import HeaderLabel from './HeaderLabel.svelte'
import ProductCell from './ProductCell.svelte'
import ReviewCell from './ReviewCell.svelte'
import ValueCell from './ValueCell.svelte'
import { changedFields, formatValue, inView, rowState } from './diff'
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

export const columns: ColumnDef<CatalogRow>[] = [
  {
    id: 'product',
    header: 'Product',
    accessorFn: (row) => row.product.name,
    filterFn: (row, _id, filter: { view: View; decisions: Decisions }) =>
      rowInView(row.original, filter.decisions, filter.view),
    cell: ({ row, table }) =>
      renderComponent(ProductCell, {
        row: row.original,
        onopen: () => getMeta(table).open(row.id),
      }),
  },
  ...fields
    .filter((f) => f.id !== 'name')
    .map((field): ColumnDef<CatalogRow> => ({
      id: field.id,
      header: () =>
        renderComponent(HeaderLabel, {
          text: field.label,
          class: field.numeric ? 'block text-right' : undefined,
        }),
      cell: ({ row }) => {
        const { product, change } = row.original
        return renderComponent(ValueCell, {
          value: formatValue(field.id, product[field.id]),
          numeric: field.numeric,
          changing:
            change?.kind === 'update' &&
            changedFields(change).includes(field.id),
          removed: change?.kind === 'delete',
        })
      },
    })),
  {
    id: 'review',
    header: () =>
      renderComponent(HeaderLabel, { text: 'Review', class: 'sr-only' }),
    cell: ({ row, table }) =>
      renderComponent(ReviewCell, {
        row: row.original,
        decisions: getMeta(table).decisions,
      }),
  },
]
