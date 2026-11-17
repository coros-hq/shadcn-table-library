import { h } from 'vue'
import type { ColumnDef, Table } from '@tanstack/vue-table'
import { Check, CircleAlert, Copy } from '@lucide/vue'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import MappingSelect from './MappingSelect.vue'
import ReviewCell from './ReviewCell.vue'
import { inView } from './review'
import type { Mapping, ReviewRow, View } from './review'
import { fieldById } from './schema'
import type { FieldId } from './schema'

export interface ReviewMeta {
  mapping: Mapping
  setField: (column: number, field: FieldId | null) => void
  setCell: (rowId: string, column: number, value: string) => void
  setSkipped: (rowIds: string[], skipped: boolean) => void
}

const getMeta = (table: Table<ReviewRow>) =>
  table.options.meta as unknown as ReviewMeta

const statusBadge = {
  ready: { label: 'Ready', icon: Check, class: '' },
  invalid: {
    label: 'Needs fixing',
    icon: CircleAlert,
    class: 'border-destructive/40 text-destructive',
  },
  duplicate: {
    label: 'Duplicate',
    icon: Copy,
    class: 'border-amber-500/50 text-amber-700 dark:text-amber-400',
  },
  skipped: { label: 'Skipped', icon: null, class: 'text-muted-foreground' },
}

const small = (text: string) =>
  h('span', { class: 'text-xs font-normal' }, text)

/** One column per CSV column, so the table always matches the file */
export function buildColumns(headers: string[]): ColumnDef<ReviewRow>[] {
  return [
    {
      id: 'include',
      header: ({ table }) => {
        const rows = table.getFilteredRowModel().rows
        const included = rows.filter((r) => r.original.status !== 'skipped')
        return h(Checkbox, {
          modelValue:
            included.length === 0
              ? false
              : included.length === rows.length
                ? true
                : 'indeterminate',
          'onUpdate:modelValue': (on: boolean | 'indeterminate') =>
            getMeta(table).setSkipped(
              rows.map((r) => r.id),
              on !== true,
            ),
          'aria-label': 'Import every row shown',
        })
      },
      cell: ({ row, table }) =>
        h(Checkbox, {
          modelValue: row.original.status !== 'skipped',
          'onUpdate:modelValue': (on: boolean | 'indeterminate') =>
            getMeta(table).setSkipped([row.id], on !== true),
          'aria-label': `Import line ${row.original.line}`,
        }),
    },
    {
      id: 'line',
      header: () => small('Line'),
      cell: ({ row }) =>
        h(
          'span',
          { class: 'text-xs text-muted-foreground tabular-nums' },
          String(row.original.line),
        ),
    },
    ...headers.map((header, column): ColumnDef<ReviewRow> => ({
      id: `col-${column}`,
      header: ({ table }) => {
        const meta = getMeta(table)
        return h(MappingSelect, {
          header,
          column,
          mapping: meta.mapping,
          onChange: (field: FieldId | null) => meta.setField(column, field),
        })
      },
      cell: ({ row, table }) => {
        const meta = getMeta(table)
        const field = meta.mapping[column]
        const value = row.original.cells[column]
        // Columns that aren't imported are shown for context only
        if (!field) {
          return h(
            'span',
            { class: 'block max-w-48 truncate px-2 text-muted-foreground/70' },
            value,
          )
        }
        return h(ReviewCell, {
          value,
          issue: row.original.issues[column],
          label: `${fieldById[field].label}, line ${row.original.line}`,
          onCommit: (next: string) => meta.setCell(row.id, column, next),
        })
      },
    })),
    {
      id: 'status',
      accessorFn: (row) => row.status,
      filterFn: (row, _id, view: View) => inView(row.original.status, view),
      header: () => small('Status'),
      cell: ({ row }) => {
        const badge = statusBadge[row.original.status]
        const count = Object.keys(row.original.issues).length
        return h(Badge, { variant: 'outline', class: badge.class }, () => [
          badge.icon ? h(badge.icon, { class: 'size-3' }) : null,
          row.original.status === 'invalid' && count > 1
            ? `${count} problems`
            : badge.label,
        ])
      },
    },
  ]
}
