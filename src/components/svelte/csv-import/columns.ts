import type { ColumnDef, Table } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import IncludeCheckbox from './IncludeCheckbox.svelte'
import MappingSelect from './MappingSelect.svelte'
import ReviewCell from './ReviewCell.svelte'
import StatusBadge from './StatusBadge.svelte'
import TextCell from './TextCell.svelte'
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

const small = (text: string) => () =>
  renderComponent(TextCell, { text, class: 'text-xs font-normal' })

/** One column per CSV column, so the table always matches the file */
export function buildColumns(headers: string[]): ColumnDef<ReviewRow>[] {
  return [
    {
      id: 'include',
      header: ({ table }) => {
        const rows = table.getFilteredRowModel().rows
        const included = rows.filter((r) => r.original.status !== 'skipped')
        return renderComponent(IncludeCheckbox, {
          checked:
            included.length === 0
              ? false
              : included.length === rows.length
                ? true
                : 'indeterminate',
          label: 'Import every row shown',
          onchange: (on: boolean) =>
            getMeta(table).setSkipped(
              rows.map((r) => r.id),
              !on,
            ),
        })
      },
      cell: ({ row, table }) =>
        renderComponent(IncludeCheckbox, {
          checked: row.original.status !== 'skipped',
          label: `Import line ${row.original.line}`,
          onchange: (on: boolean) => getMeta(table).setSkipped([row.id], !on),
        }),
    },
    {
      id: 'line',
      header: small('Line'),
      cell: ({ row }) =>
        renderComponent(TextCell, {
          text: String(row.original.line),
          class: 'text-xs text-muted-foreground tabular-nums',
        }),
    },
    ...headers.map((header, column): ColumnDef<ReviewRow> => ({
      id: `col-${column}`,
      header: ({ table }) => {
        const meta = getMeta(table)
        return renderComponent(MappingSelect, {
          header,
          column,
          mapping: meta.mapping,
          onchange: (field: FieldId | null) => meta.setField(column, field),
        })
      },
      cell: ({ row, table }) => {
        const meta = getMeta(table)
        const field = meta.mapping[column]
        const value = row.original.cells[column]
        // Columns that aren't imported are shown for context only
        if (!field) {
          return renderComponent(TextCell, {
            text: value,
            class: 'block max-w-48 truncate px-2 text-muted-foreground/70',
          })
        }
        return renderComponent(ReviewCell, {
          value,
          issue: row.original.issues[column],
          label: `${fieldById[field].label}, line ${row.original.line}`,
          oncommit: (next: string) => meta.setCell(row.id, column, next),
        })
      },
    })),
    {
      id: 'status',
      accessorFn: (row) => row.status,
      filterFn: (row, _id, view: View) => inView(row.original.status, view),
      header: small('Status'),
      cell: ({ row }) =>
        renderComponent(StatusBadge, {
          status: row.original.status,
          problems: Object.keys(row.original.issues).length,
        }),
    },
  ]
}
