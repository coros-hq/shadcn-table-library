import type { ColumnDef, Table } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import DraftActions from './DraftActions.svelte'
import DraftField from './DraftField.svelte'
import TextCell from './TextCell.svelte'
import { formatDate, money } from './drafts'
import type { Field } from './drafts'
import type { DraftMeta, Row } from './types'

const getMeta = (table: Table<Row>) =>
  table.options.meta as unknown as DraftMeta

type SavedRow = Extract<Row, { kind: 'saved' }>

/** Text for a saved row, an input for a draft */
const fieldColumn = (
  field: Field,
  header: ColumnDef<Row>['header'],
  text: (row: SavedRow) => string,
  className = '',
): ColumnDef<Row> => ({
  id: field,
  header,
  cell: ({ row: { original: row }, table }) =>
    row.kind === 'saved'
      ? renderComponent(TextCell, { text: text(row), class: className })
      : renderComponent(DraftField, { row, field, meta: getMeta(table) }),
})

export const columns: ColumnDef<Row>[] = [
  fieldColumn(
    'date',
    'Date',
    (row) => formatDate(row.expense.date),
    'tabular-nums',
  ),
  fieldColumn('description', 'Description', (row) => row.expense.description),
  fieldColumn('category', 'Category', (row) => row.expense.category),
  fieldColumn(
    'amount',
    () =>
      renderComponent(TextCell, { text: 'Amount', class: 'block text-right' }),
    (row) => money(row.expense.amount),
    'block text-right tabular-nums',
  ),
  {
    id: 'actions',
    header: () =>
      renderComponent(TextCell, { text: 'Actions', class: 'sr-only' }),
    cell: ({ row: { original: row }, table }) =>
      row.kind === 'saved'
        ? null
        : renderComponent(DraftActions, { row, meta: getMeta(table) }),
  },
]
