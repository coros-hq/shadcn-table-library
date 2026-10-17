import { columnCode, str } from './column-types'
import filterBarSource from './filter-bar.tsx?raw'
import filtersSource from './filters.ts?raw'
import { PAGE_SIZES, buildRows, effectiveAlign } from './schema'
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
const SKELETON_ALIGN = `
const skeletonClass = {
  left: '',
  center: 'mx-auto',
  right: 'ml-auto',
} as const
`

export function generate(state: BuilderState): GeneratedFile[] {
  const has = (feature: BuilderState['features'][number]) =>
    state.features.includes(feature)
  const { columns } = state
  const hasType = (type: ColumnSpec['type']) =>
    columns.some((c) => c.type === type)
  const filters = has('filters') && columns.length > 0
  const aligned = columns.some((c) => effectiveAlign(c) !== 'left')
  const { states } = state
  const skeleton = states.loadingStyle === 'skeleton'

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
      filters && `import type { FacetDef, Field, Preset } from './filters'`,
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
]

// One control per column in the toolbar
export const facets: FacetDef[] = [${
          state.facets.length
            ? `\n${state.facets
                .map(
                  (f) =>
                    `  { fieldId: ${str(f.fieldId)}, kind: ${str(f.kind)} },`,
                )
                .join('\n')}\n`
            : ''
        }]

// One-click shortcuts that toggle a fixed rule
export const presets: Preset[] = [${
          state.presets.length
            ? `\n${state.presets
                .map(
                  (p) =>
                    `  {\n    id: ${str(p.id)},\n    label: ${str(p.label)},\n    rule: { fieldId: ${str(p.rule.fieldId)}, op: ${str(p.rule.op)}, value: ${str(p.rule.value)} },\n  },`,
                )
                .join('\n')}\n`
            : ''
        }]`
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
    return `import { columns${filters ? ', facets, fields, presets' : ''} } from './columns'
import { DataTable } from './data-table'
import { rows } from './data'

export function MyTable() {
  // Set this while your data is being fetched
  const isLoading = false

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}${
        filters
          ? `
      fields={fields}
      facets={facets}
      presets={presets}`
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
    const arrows = has('pagination') && state.pager.style === 'arrows'
    const sizeSelect = has('pagination') && state.pager.sizeSelect
    const icons = [
      ...(skeleton ? [] : ['LoaderCircle']),
      ...(has('sorting') ? ['ArrowDown', 'ArrowUp', 'ArrowUpDown'] : []),
      ...(arrows
        ? ['ChevronLeft', 'ChevronRight', 'ChevronsLeft', 'ChevronsRight']
        : []),
    ]
    const tableState = [
      has('sorting') && 'sorting',
      has('search') && 'globalFilter',
    ].filter(Boolean)

    return `'use client'

${react.length ? `import { ${react.join(', ')} } from 'react'\n` : ''}import {
${tanstack.map((n) => `  ${n},`).join('\n')}
} from '@tanstack/react-table'
import type { ColumnDef${has('sorting') ? ', SortingState' : ''} } from '@tanstack/react-table'
${icons.length ? `import { ${icons.join(', ')} } from 'lucide-react'\n` : ''}
${has('pagination') ? `import { Button } from '#/components/ui/button'\n` : ''}${has('search') ? `import { Input } from '#/components/ui/input'\n` : ''}${
      sizeSelect
        ? `import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'\n`
        : ''
    }${skeleton ? `import { Skeleton } from '#/components/ui/skeleton'\n` : ''}import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
${aligned ? ALIGN_HELPERS : ''}${aligned && skeleton ? SKELETON_ALIGN : ''}${filters ? `import { FilterBar } from './filter-bar'\nimport { applyFacets, applyRules } from './filters'\nimport type { FacetDef, FacetValue, Field, Preset } from './filters'\n` : ''}
interface DataTableProps<TData${filters ? ' extends Record<string, unknown>' : ''}, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Shows the loading state instead of rows */
  isLoading?: boolean${
    filters
      ? `
  fields: Field[]
  facets: FacetDef[]
  presets: Preset[]`
      : ''
  }
}

export function DataTable<TData${filters ? ' extends Record<string, unknown>' : ''}, TValue>({
  columns,
  data,
  isLoading = false,${filters ? '\n  fields,\n  facets,\n  presets,' : ''}
}: DataTableProps<TData, TValue>) {
${has('sorting') ? `  const [sorting, setSorting] = useState<SortingState>([])\n` : ''}${has('search') ? `  const [globalFilter, setGlobalFilter] = useState('')\n` : ''}${
      filters
        ? `  const [facetValues, setFacetValues] = useState<Record<string, FacetValue>>({})
  const [activePresets, setActivePresets] = useState<string[]>([])

  // Facets and quick filters narrow the data before the table sees it
  const rows = useMemo(() => {
    const rules = presets
      .filter((p) => activePresets.includes(p.id))
      .map((p) => p.rule)
    return applyRules(applyFacets(data, facets, facetValues), fields, rules)
  }, [data, fields, facets, presets, facetValues, activePresets])
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
}${
        filters
          ? `        <FilterBar
          fields={fields}
          facets={facets}
          presets={presets}
          data={data}
          values={facetValues}
          onValuesChange={setFacetValues}
          activePresets={activePresets}
          onActivePresetsChange={setActivePresets}
        />\n`
          : ''
      }      </div>
`
    : ''
}      <div className="overflow-x-auto rounded-md border" aria-busy={isLoading}>
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
${loadingBody()}
            ) : table.getRowModel().rows.length ? (
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
${emptyBody()}
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

  function emptyBody() {
    const { emptyTitle, emptyDescription } = states
    const title = emptyTitle.trim()
      ? `                  <p className="text-sm font-medium">{${str(emptyTitle)}}</p>\n`
      : ''
    const description = emptyDescription.trim()
      ? `                  <p className="text-sm text-muted-foreground">\n                    {${str(emptyDescription)}}\n                  </p>\n`
      : ''
    // A cell with nothing in it would read as a broken table
    return (
      (title + description).trimEnd() ||
      `                  <p className="text-sm text-muted-foreground">No results.</p>`
    )
  }

  function loadingBody() {
    if (!skeleton) {
      return `            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
                  <div
                    role="status"
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  >
                    <LoaderCircle className="size-4 animate-spin" />
                    {${str(states.loadingMessage)}}
                  </div>
                </TableCell>
              </TableRow>`
    }
    const message = states.loadingMessage.trim()
      ? `                  {rowIndex === 0 && index === 0 ? (
                    <span role="status" className="sr-only">
                      {${str(states.loadingMessage)}}
                    </span>
                  ) : null}\n`
      : ''
    return `            {isLoading ? (
              Array.from({ length: ${states.loadingRows} }, (_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {table.getVisibleLeafColumns().map((column, index) => (
                    <TableCell key={column.id}>
${message}                      <Skeleton className=${
      aligned
        ? '{`h-4 w-3/4 ${skeletonClass[alignOf(column.columnDef)]}`}'
        : '"h-4 w-3/4"'
    } />
                    </TableCell>
                  ))}
                </TableRow>
              ))`
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
    const arrows = state.pager.style === 'arrows'
    const sizeSelect = state.pager.sizeSelect
    const button = (dir: 'previous' | 'next') => `          <Button
            variant="outline"
            size="${arrows ? 'icon' : 'sm'}"${arrows ? '\n            className="size-8"' : ''}
            onClick={() => table.${dir}Page()}
            disabled={!table.getCan${dir === 'previous' ? 'Previous' : 'Next'}Page()}
            aria-label="${dir === 'previous' ? 'Previous' : 'Next'} page"
          >
            ${
              arrows
                ? `<Chevron${dir === 'previous' ? 'Left' : 'Right'} className="h-4 w-4" />`
                : dir === 'previous'
                  ? 'Previous'
                  : 'Next'
            }
          </Button>`
    const edge = (dir: 'first' | 'last') =>
      arrows
        ? `          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.setPageIndex(${dir === 'first' ? '0' : 'table.getPageCount() - 1'})}
            disabled={!table.getCan${dir === 'first' ? 'Previous' : 'Next'}Page()}
            aria-label="${dir === 'first' ? 'First' : 'Last'} page"
          >
            <Chevrons${dir === 'first' ? 'Left' : 'Right'} className="h-4 w-4" />
          </Button>
`
        : ''
    const pager = has('pagination')
      ? `        <div className="flex items-center gap-4">
${
  sizeSelect
    ? `          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
${PAGE_SIZES.map((n) => `                <SelectItem value="${n}">${n}</SelectItem>`).join('\n')}
              </SelectContent>
            </Select>
          </div>
`
    : ''
}${
          arrows
            ? `          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {Math.max(table.getPageCount(), 1)}
          </span>
`
            : ''
        }          <div className="flex items-center gap-2">
${edge('first')}${button('previous')}
${button('next')}
${edge('last')}          </div>
        </div>
`
      : ''
    return `      <div className="flex items-center justify-between py-3">
${summary}${pager}      </div>
`
  }
}

/** The shadcn components the generated code imports */
export function registryDependencies(state: BuilderState) {
  const parts = ['table']
  const filters = state.features.includes('filters') && state.columns.length > 0
  if (state.features.includes('pagination') || filters) parts.push('button')
  if (state.features.includes('search') || filters) parts.push('input')
  if (state.features.includes('selection') || filters) parts.push('checkbox')
  if (filters) parts.push('popover')
  if (state.features.includes('pagination') && state.pager.sizeSelect) {
    parts.push('select')
  }
  if (filters || state.columns.some((c) => c.type === 'select')) {
    parts.push('badge')
  }
  if (state.states.loadingStyle === 'skeleton') parts.push('skeleton')
  return [...new Set(parts)]
}

/** The shadcn components the generated code imports, as one CLI command */
export function installCommand(state: BuilderState) {
  return `npx shadcn@latest add ${registryDependencies(state).join(' ')}`
}

export const REGISTRY_ORIGIN = 'https://www.shad-table.dev'

/** One command that drops the whole table, and what it needs, into a project */
export function registryCommand(encodedState: string) {
  return `npx shadcn@latest add '${REGISTRY_ORIGIN}/r/builder.json?t=${encodedState}'`
}

/** The table as a shadcn registry item, served at /r/builder.json */
export function registryItem(state: BuilderState) {
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: 'my-table',
    title: 'My Table',
    description: `A TanStack Table with ${state.columns.length} columns, built with the ShadTable builder.`,
    type: 'registry:block',
    dependencies: ['@tanstack/react-table@^8.21.3', 'lucide-react'],
    registryDependencies: registryDependencies(state),
    files: generate(state).map((file) => ({
      path: file.path,
      content: file.code,
      type: 'registry:component',
      target: `@components/tables/my-table/${file.path.split('/').pop()}`,
    })),
  }
}
