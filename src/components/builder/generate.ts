import { columnCode, str } from './column-types'
import filterBarSource from './filter-bar.tsx?raw'
import filtersSource from './filters.ts?raw'
import { buildRows, effectiveAlign } from './schema'
import type { BuilderState, ColumnSpec } from './schema'

export interface GeneratedFile {
  path: string
  code: string
}

const DIR = 'src/components/my-table'

const tsType = (column: ColumnSpec) =>
  column.type === 'number'
    ? 'number'
    : column.type === 'checkbox'
      ? 'boolean'
      : 'string'

const literal = (value: string | number | boolean) =>
  typeof value === 'string' ? str(value) : String(value)

const ALIGN_HELPERS = `
const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const
const justifyClass = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const
type Align = keyof typeof alignClass

// Alignment is set per column in \`meta: { align }\`
const alignOf = (def: { meta?: unknown }): Align =>
  (def.meta as { align?: Align } | undefined)?.align ?? 'left'
`

export function generate(state: BuilderState): GeneratedFile[] {
  const has = (feature: BuilderState['features'][number]) =>
    state.features.includes(feature)
  const { columns } = state
  const hasType = (type: ColumnSpec['type']) =>
    columns.some((c) => c.type === type)
  const filters = has('filters') && columns.length > 0
  const aligned = columns.some((c) => effectiveAlign(c) !== 'left')

  const files: GeneratedFile[] = [
    { path: `${DIR}/columns.tsx`, code: columnsFile() },
    { path: `${DIR}/data-table.tsx`, code: dataTableFile() },
    { path: `${DIR}/index.tsx`, code: indexFile() },
    { path: `${DIR}/data.ts`, code: dataFile() },
  ]
  if (filters) {
    files.push(
      { path: `${DIR}/filters.ts`, code: filtersSource },
      { path: `${DIR}/filter-bar.tsx`, code: filterBarSource },
    )
  }
  return files

  function columnsFile() {
    const imports = [
      `import type { ColumnDef } from '@tanstack/react-table'`,
      hasType('checkbox') && `import { Check } from 'lucide-react'`,
      hasType('select') && `import { Badge } from '#/components/ui/badge'`,
      has('selection') && `import { Checkbox } from '#/components/ui/checkbox'`,
      filters && `import type { Field } from './filters'`,
      `import type { Row } from './data'`,
    ].filter(Boolean)

    const entries = [
      has('selection') &&
        `  {
    id: 'select',
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },`,
      ...columns.map(columnCode),
    ].filter(Boolean)

    const fields = filters
      ? `

// What the filter bar needs to know about each column
export const fields: Field[] = [
${columns
  .map(
    (c) =>
      `  { id: ${str(c.id)}, name: ${str(c.name)}, type: ${str(c.type)}${
        c.type === 'select'
          ? `, options: [${(c.options ?? []).map(str).join(', ')}]`
          : ''
      } },`,
  )
  .join('\n')}
]`
      : ''

    return `'use client'

${imports.join('\n')}
${
  hasType('date')
    ? `
// Dates are stored as ISO strings; formatting in UTC keeps the server and the
// browser from disagreeing about which day it is.
const dateFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})
`
    : ''
}
export const columns: ColumnDef<Row>[] = [
${entries.join('\n')}
]${fields}
`
  }

  function dataFile() {
    const rows = buildRows(columns)
    const type = `export type Row = {
  id: string
${columns.map((c) => `  ${c.id}: ${tsType(c)}`).join('\n')}
}`
    const body = rows
      .map(
        (row) =>
          `  {\n${Object.entries(row)
            .map(([key, value]) => `    ${key}: ${literal(value)},`)
            .join('\n')}\n  },`,
      )
      .join('\n')
    return `${type}

// Sample data. Replace it with your own rows (or a fetch) of the same shape.
export const rows: Row[] = [
${body}
]
`
  }

  function indexFile() {
    const rules = state.filters
      .map(
        (r) =>
          `  { fieldId: ${str(r.fieldId)}, op: ${str(r.op)}, value: ${str(r.value)} },`,
      )
      .join('\n')
    return `import { columns${filters ? ', fields' : ''} } from './columns'
import { DataTable } from './data-table'
import { rows } from './data'
${filters ? `import type { FilterRule } from './filters'\n` : ''}${
      filters
        ? `
// Filters applied when the table first renders
const defaultFilters: FilterRule[] = [${rules ? `\n${rules}\n` : ''}]
`
        : ''
    }
export function MyTable() {
  return (
    <DataTable
      columns={columns}
      data={rows}${
        filters
          ? `
      fields={fields}
      defaultFilters={defaultFilters}`
          : ''
      }
    />
  )
}
`
  }

  function dataTableFile() {
    const rowModels = [
      'getCoreRowModel',
      has('search') && 'getFilteredRowModel',
      has('pagination') && 'getPaginationRowModel',
      has('sorting') && 'getSortedRowModel',
    ].filter(Boolean) as string[]
    const tanstack = ['flexRender', ...rowModels, 'useReactTable'].sort(
      (a, b) => a.localeCompare(b),
    )
    const stateful = has('search') || has('sorting')
    const react = [
      (stateful || filters) && 'useState',
      filters && 'useMemo',
    ].filter(Boolean)
    const footer = has('pagination') || has('selection')
    const toolbar = has('search') || filters
    const tableState = [
      has('sorting') && 'sorting',
      has('search') && 'globalFilter',
    ].filter(Boolean)

    return `'use client'

${react.length ? `import { ${react.join(', ')} } from 'react'\n` : ''}import {
${tanstack.map((n) => `  ${n},`).join('\n')}
} from '@tanstack/react-table'
import type { ColumnDef${has('sorting') ? ', SortingState' : ''} } from '@tanstack/react-table'
${has('sorting') ? `import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'\n` : ''}
${has('pagination') ? `import { Button } from '#/components/ui/button'\n` : ''}${has('search') ? `import { Input } from '#/components/ui/input'\n` : ''}import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
${aligned ? ALIGN_HELPERS : ''}${filters ? `import { FilterBar } from './filter-bar'\nimport { applyRules } from './filters'\nimport type { Field, FilterRule } from './filters'\n` : ''}
interface DataTableProps<TData${filters ? ' extends Record<string, unknown>' : ''}, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]${
    filters
      ? `
  fields: Field[]
  defaultFilters?: FilterRule[]`
      : ''
  }
}

export function DataTable<TData${filters ? ' extends Record<string, unknown>' : ''}, TValue>({
  columns,
  data,${filters ? '\n  fields,\n  defaultFilters = [],' : ''}
}: DataTableProps<TData, TValue>) {
${has('sorting') ? `  const [sorting, setSorting] = useState<SortingState>([])\n` : ''}${has('search') ? `  const [globalFilter, setGlobalFilter] = useState('')\n` : ''}${
      filters
        ? `  const [rules, setRules] = useState<FilterRule[]>(defaultFilters)

  // Several rules per column don't fit TanStack's columnFilters, so rules
  // narrow the data before the table sees it.
  const rows = useMemo(
    () => applyRules(data, fields, rules),
    [data, fields, rules],
  )
`
        : ''
    }
  const table = useReactTable({
    data: ${filters ? 'rows' : 'data'},
    columns,
${rowModels.map((n) => `    ${n}: ${n}(),`).join('\n')}
${has('pagination') ? `    initialState: { pagination: { pageSize: 5 } },\n` : ''}${has('sorting') ? `    onSortingChange: setSorting,\n` : ''}${has('search') ? `    onGlobalFilterChange: setGlobalFilter,\n` : ''}${tableState.length ? `    state: { ${tableState.join(', ')} },\n` : ''}  })

  return (
    <div>
${
  toolbar
    ? `      <div className="mb-3 flex flex-wrap items-center gap-2">
${
  has('search')
    ? `        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="w-full sm:w-72"
        />
`
    : ''
}${filters ? `        <FilterBar fields={fields} rules={rules} onChange={setRules} />\n` : ''}      </div>
`
    : ''
}      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}${aligned ? ' className={alignClass[alignOf(header.column.columnDef)]}' : ''}>
${headerBody()}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}${aligned ? ' className={alignClass[alignOf(cell.column.columnDef)]}' : ''}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
${footer ? footerBody() : ''}    </div>
  )
}
`
  }

  function headerBody() {
    const plain = `flexRender(header.column.columnDef.header, header.getContext())`
    if (!has('sorting')) {
      return `                    {header.isPlaceholder
                      ? null
                      : ${plain}}`
    }
    return `                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        ${
                          aligned
                            ? 'className={`flex w-full cursor-pointer items-center gap-2 select-none ${justifyClass[alignOf(header.column.columnDef)]}`}'
                            : 'className="flex w-full cursor-pointer items-center gap-2 select-none"'
                        }
                      >
                        {${plain}}
                        {header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    ) : (
                      ${plain}
                    )}`
  }

  function footerBody() {
    const summary = has('selection')
      ? `        <p className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected
        </p>
`
      : `        <span />
`
    const pager = has('pagination')
      ? `        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
`
      : ''
    return `      <div className="flex items-center justify-between py-3">
${summary}${pager}      </div>
`
  }
}

/** The shadcn components the generated code imports, as one CLI command */
export function installCommand(state: BuilderState) {
  const parts = ['table']
  const filters = state.features.includes('filters') && state.columns.length > 0
  if (state.features.includes('pagination') || filters) parts.push('button')
  if (state.features.includes('search') || filters) parts.push('input')
  if (state.features.includes('selection')) parts.push('checkbox')
  if (filters) parts.push('popover', 'select')
  if (filters || state.columns.some((c) => c.type === 'select')) {
    parts.push('badge')
  }
  return `npx shadcn@latest add ${[...new Set(parts)].join(' ')}`
}
