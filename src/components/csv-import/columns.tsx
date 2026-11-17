import { Check, CircleAlert, Copy } from 'lucide-react'
import type { ColumnDef, Table } from '@tanstack/react-table'

import { Badge } from '#/components/ui/badge'
import { Checkbox } from '#/components/ui/checkbox'
import { MappingSelect } from './mapping-select'
import { ReviewCell } from './review-cell'
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
  ready: { label: 'Ready', icon: Check, className: '' },
  invalid: {
    label: 'Needs fixing',
    icon: CircleAlert,
    className: 'border-destructive/40 text-destructive',
  },
  duplicate: {
    label: 'Duplicate',
    icon: Copy,
    className: 'border-amber-500/50 text-amber-700 dark:text-amber-400',
  },
  skipped: { label: 'Skipped', icon: null, className: 'text-muted-foreground' },
}

/** One column per CSV column, so the table always matches the file */
export function buildColumns(headers: string[]): ColumnDef<ReviewRow>[] {
  return [
    {
      id: 'include',
      header: ({ table }) => {
        const { setSkipped } = getMeta(table)
        const rows = table.getFilteredRowModel().rows
        const included = rows.filter((r) => r.original.status !== 'skipped')
        return (
          <Checkbox
            checked={
              included.length === 0
                ? false
                : included.length === rows.length
                  ? true
                  : 'indeterminate'
            }
            onCheckedChange={(on) =>
              setSkipped(
                rows.map((r) => r.id),
                on !== true,
              )
            }
            aria-label="Import every row shown"
          />
        )
      },
      cell: ({ row, table }) => (
        <Checkbox
          checked={row.original.status !== 'skipped'}
          onCheckedChange={(on) =>
            getMeta(table).setSkipped([row.id], on !== true)
          }
          aria-label={`Import line ${row.original.line}`}
        />
      ),
    },
    {
      id: 'line',
      header: () => <span className="text-xs font-normal">Line</span>,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {row.original.line}
        </span>
      ),
    },
    ...headers.map((header, column): ColumnDef<ReviewRow> => ({
      id: `col-${column}`,
      header: ({ table }) => {
        const meta = getMeta(table)
        return (
          <MappingSelect
            header={header}
            column={column}
            mapping={meta.mapping}
            onChange={(field) => meta.setField(column, field)}
          />
        )
      },
      cell: ({ row, table }) => {
        const meta = getMeta(table)
        const field = meta.mapping[column]
        const value = row.original.cells[column]
        // Columns that aren't imported are shown for context only
        if (!field) {
          return (
            <span className="block max-w-48 truncate px-2 text-muted-foreground/70">
              {value}
            </span>
          )
        }
        return (
          <ReviewCell
            value={value}
            issue={row.original.issues[column]}
            label={`${fieldById[field].label}, line ${row.original.line}`}
            onCommit={(next) => meta.setCell(row.id, column, next)}
          />
        )
      },
    })),
    {
      id: 'status',
      accessorFn: (row) => row.status,
      filterFn: (row, _id, view: View) => inView(row.original.status, view),
      header: () => <span className="text-xs font-normal">Status</span>,
      cell: ({ row }) => {
        const badge = statusBadge[row.original.status]
        const Icon = badge.icon
        const count = Object.keys(row.original.issues).length
        return (
          <Badge variant="outline" className={badge.className}>
            {Icon ? <Icon className="size-3" /> : null}
            {row.original.status === 'invalid' && count > 1
              ? `${count} problems`
              : badge.label}
          </Badge>
        )
      },
    },
  ]
}
