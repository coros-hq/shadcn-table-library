import { h } from 'vue'
import type { ColumnDef, Table } from '@tanstack/vue-table'
import { TriangleAlert, X } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import DraftField from './DraftField.vue'
import { formatDate, money } from './drafts'
import type { Field } from './drafts'
import type { DraftMeta, Row } from './types'

const getMeta = (table: Table<Row>) =>
  table.options.meta as unknown as DraftMeta

/** Text for a saved row, an input for a draft */
const fieldColumn = (
  field: Field,
  header: ColumnDef<Row>['header'],
  saved: (
    row: Extract<Row, { kind: 'saved' }>,
  ) => ReturnType<typeof h> | string,
): ColumnDef<Row> => ({
  id: field,
  header,
  cell: ({ row: { original: row }, table }) =>
    row.kind === 'saved'
      ? saved(row)
      : h(DraftField, { row, field, meta: getMeta(table) }),
})

export const columns: ColumnDef<Row>[] = [
  fieldColumn('date', 'Date', (row) =>
    h('span', { class: 'tabular-nums' }, formatDate(row.expense.date)),
  ),
  fieldColumn('description', 'Description', (row) => row.expense.description),
  fieldColumn('category', 'Category', (row) => row.expense.category),
  fieldColumn(
    'amount',
    () => h('span', { class: 'block text-right' }, 'Amount'),
    (row) =>
      h(
        'span',
        { class: 'block text-right tabular-nums' },
        money(row.expense.amount),
      ),
  ),
  {
    id: 'actions',
    header: () => h('span', { class: 'sr-only' }, 'Actions'),
    cell: ({ row: { original: row }, table }) => {
      if (row.kind === 'saved') return null
      const meta = getMeta(table)
      return h('div', { class: 'flex items-center justify-end gap-1' }, [
        meta.duplicates.has(row.id)
          ? h(
              'span',
              {
                title: 'Same date, amount and description as another expense',
                class:
                  'flex items-center gap-1 text-xs whitespace-nowrap text-amber-700 dark:text-amber-400',
              },
              [
                h(TriangleAlert, { 'aria-hidden': 'true', class: 'size-3.5' }),
                'Duplicate?',
              ],
            )
          : null,
        h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            class: 'size-8',
            disabled: meta.saving,
            'aria-label': `Remove new row ${row.number}`,
            onClick: () => meta.remove(row.id),
          },
          () => h(X),
        ),
      ])
    },
  },
]
