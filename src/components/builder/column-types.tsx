import type { ColumnDef } from '@tanstack/react-table'
import { Check } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { effectiveAlign } from './schema'
import type { ColumnSpec, Row } from './schema'

// Each column type exists twice, side by side: `columnDef` drives the live
// preview and `columnCode` is the source that lands in the generated
// columns.tsx. Change one, change the other. The generator tests parse every
// type's output so a typo in the code string fails CI.

export const dateFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

const parseDate = (value: unknown) => new Date(`${String(value)}T00:00:00Z`)

/** A JS string literal in the style of the generated code */
export const str = (value: string) =>
  `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

export function columnDef(column: ColumnSpec): ColumnDef<Row> {
  // Alignment lives in `meta`; the table applies it to the header and cells
  // The filter-toolbar demo augments ColumnMeta with a required `label`,
  // which a generated table (without that augmentation) doesn't have
  const meta = {
    align: effectiveAlign(column),
  } as unknown as ColumnDef<Row>['meta']
  return { ...baseColumnDef(column), meta }
}

function baseColumnDef(column: ColumnSpec): ColumnDef<Row> {
  const get = (row: Row) => row[column.id]

  switch (column.type) {
    case 'text':
      return { accessorKey: column.id, header: column.name }
    case 'number':
      return {
        accessorKey: column.id,
        header: column.name,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {Number(get(row.original)).toLocaleString('en-US')}
          </span>
        ),
      }
    case 'select':
      return {
        accessorKey: column.id,
        header: column.name,
        cell: ({ row }) => (
          <Badge variant="outline">{String(get(row.original))}</Badge>
        ),
      }
    case 'date':
      return {
        accessorKey: column.id,
        header: column.name,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {dateFormat.format(parseDate(get(row.original)))}
          </span>
        ),
      }
    case 'checkbox':
      return {
        accessorKey: column.id,
        header: column.name,
        cell: ({ row }) =>
          get(row.original) ? (
            <Check className="size-4" aria-label="Yes" />
          ) : null,
      }
  }
}

/** One element of the generated `columns` array, indented for that array */
export function columnCode(column: ColumnSpec): string {
  const align = effectiveAlign(column)
  const meta = align === 'left' ? '' : `\n    meta: { align: '${align}' },`
  return baseColumnCode(column).replace(/\n  },$/, `${meta}\n  },`)
}

function baseColumnCode(column: ColumnSpec): string {
  const key = `accessorKey: ${str(column.id)},`
  const row = `row.original.${column.id}`

  switch (column.type) {
    case 'text':
      return `  {
    ${key}
    header: ${str(column.name)},
  },`
    case 'number':
      return `  {
    ${key}
    header: ${str(column.name)},
    cell: ({ row }) => (
      <span className="tabular-nums">
        {${row}.toLocaleString('en-US')}
      </span>
    ),
  },`
    case 'select':
      return `  {
    ${key}
    header: ${str(column.name)},
    cell: ({ row }) => <Badge variant="outline">{${row}}</Badge>,
  },`
    case 'date':
      return `  {
    ${key}
    header: ${str(column.name)},
    cell: ({ row }) => (
      <span className="tabular-nums">
        {dateFormat.format(new Date(\`\${${row}}T00:00:00Z\`))}
      </span>
    ),
  },`
    case 'checkbox':
      return `  {
    ${key}
    header: ${str(column.name)},
    cell: ({ row }) =>
      ${row} ? <Check className="size-4" aria-label="Yes" /> : null,
  },`
  }
}
