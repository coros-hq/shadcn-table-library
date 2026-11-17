import type { ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Check } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { EditableCell } from './editable-cell'
import type { EditField } from './editable-cell'
import { effectiveAlign } from './schema'
import type { ColumnSpec, Row } from './schema'

// Each column type exists twice, side by side: `display` drives the live
// preview and `displayCode` is the source that lands in the generated
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

export interface ColumnOptions {
  /** Cells edit inline (the editing feature is on and the column allows it) */
  editable: boolean
  /** TanStack column sizes are in use (pinning lays the table out fixed) */
  sized: boolean
  /** The data has empty cells in this number column */
  nullable?: boolean
}

export const isEditable = (column: ColumnSpec, editing: boolean) =>
  editing && !column.readOnly

/** What an EditableCell needs to know about a column */
export function editField(column: ColumnSpec): EditField {
  return {
    type: column.type,
    ...(column.type === 'select' && { options: column.options ?? [] }),
    ...(column.rules && { rules: column.rules }),
  }
}

function display(column: ColumnSpec, value: unknown): ReactNode {
  switch (column.type) {
    case 'text':
      return String(value ?? '')
    case 'number':
      // An empty cell in imported data
      if (value === null || value === '') return null
      return (
        <span className="tabular-nums">
          {Number(value).toLocaleString('en-US')}
        </span>
      )
    case 'select':
      return <Badge variant="outline">{String(value)}</Badge>
    case 'date':
      return (
        <span className="tabular-nums">
          {value ? dateFormat.format(parseDate(value)) : null}
        </span>
      )
    case 'checkbox':
      return value ? <Check className="size-4" aria-label="Yes" /> : null
  }
}

export function columnDef(
  column: ColumnSpec,
  options: ColumnOptions = { editable: false, sized: false },
): ColumnDef<Row> {
  // Alignment lives in `meta`; the table applies it to the header and cells
  // The filter-toolbar demo augments ColumnMeta with a required `label`,
  // which a generated table (without that augmentation) doesn't have
  const meta = {
    align: effectiveAlign(column),
  } as unknown as ColumnDef<Row>['meta']
  const base: ColumnDef<Row> = {
    accessorKey: column.id,
    header: column.name,
    meta,
    ...(options.sized && { size: columnSize(column) }),
  }
  if (options.editable) {
    const field = editField(column)
    return {
      ...base,
      cell: (context) => (
        <EditableCell context={context} field={field}>
          {column.type === 'checkbox'
            ? undefined
            : display(column, context.getValue())}
        </EditableCell>
      ),
    }
  }
  // Plain text needs no cell: TanStack renders the value as is
  if (column.type === 'text') return base
  return { ...base, cell: ({ getValue }) => display(column, getValue()) }
}

/** Widths for a fixed layout: wide enough for each type's usual content */
export function columnSize(column: ColumnSpec) {
  switch (column.type) {
    case 'checkbox':
      return 100
    case 'number':
    case 'date':
      return 140
    default:
      return 180
  }
}

/** The JSX for one cell's value, reading it from `value` */
function displayCode(
  column: ColumnSpec,
  value: string,
  nullable = false,
): string | null {
  switch (column.type) {
    case 'text':
      return null
    case 'number':
      return `<span className="tabular-nums">
        {${value}${nullable ? '?' : ''}.toLocaleString('en-US')}
      </span>`
    case 'select':
      return `<Badge variant="outline">{${value}}</Badge>`
    case 'date':
      return `<span className="tabular-nums">
        {dateFormat.format(new Date(\`\${${value}}T00:00:00Z\`))}
      </span>`
    case 'checkbox':
      return `${value} ? <Check className="size-4" aria-label="Yes" /> : null`
  }
}

/** An EditField object literal, for the generated code */
export function editFieldCode(column: ColumnSpec): string {
  const field = editField(column)
  const parts = [`type: ${str(field.type)}`]
  if (field.options) {
    parts.push(`options: [${field.options.map(str).join(', ')}]`)
  }
  if (field.rules) {
    const rules = Object.entries(field.rules).map(
      ([key, value]) => `${key}: ${String(value)}`,
    )
    parts.push(`rules: { ${rules.join(', ')} }`)
  }
  return `{ ${parts.join(', ')} }`
}

/** One element of the generated `columns` array, indented for that array */
export function columnCode(
  column: ColumnSpec,
  options: ColumnOptions = { editable: false, sized: false },
): string {
  const align = effectiveAlign(column)
  const lines = [
    `accessorKey: ${str(column.id)},`,
    `header: ${str(column.name)},`,
  ]
  if (options.sized) lines.push(`size: ${columnSize(column)},`)

  if (options.editable) {
    const shown =
      column.type === 'checkbox'
        ? null
        : displayCode(column, `row.original.${column.id}`, options.nullable)
    lines.push(
      shown
        ? `cell: (context) => {
      const { row } = context
      return (
        <EditableCell context={context} field={${editFieldCode(column)}}>
          ${shown.replace(/\n/g, '\n    ')}
        </EditableCell>
      )
    },`
        : `cell: (context) => (
      <EditableCell context={context} field={${editFieldCode(column)}} />
    ),`,
    )
  } else {
    const shown = displayCode(
      column,
      `row.original.${column.id}`,
      options.nullable,
    )
    if (shown) {
      lines.push(
        shown.includes('\n')
          ? `cell: ({ row }) => (
      ${shown}
    ),`
          : column.type === 'checkbox'
            ? `cell: ({ row }) =>
      ${shown},`
            : `cell: ({ row }) => ${shown},`,
      )
    }
  }
  if (align !== 'left') lines.push(`meta: { align: '${align}' },`)

  return `  {\n${lines.map((l) => `    ${l}`).join('\n')}\n  },`
}
