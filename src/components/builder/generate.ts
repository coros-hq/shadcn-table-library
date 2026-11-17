import { columnCode, isEditable, str } from './column-types'
import columnControlsSource from './column-controls.tsx?raw'
import editableCellSource from './editable-cell.tsx?raw'
import exportMenuSource from './export-menu.tsx?raw'
import filterBarSource from './filter-bar.tsx?raw'
import filtersSource from './filters.ts?raw'
import rowActionsSource from './row-actions.tsx?raw'
import { MAX_EMBEDDED_ROWS } from './import'
import { PAGE_SIZES, buildRows, effectiveAlign, exportFilename } from './schema'
import type { BuilderState, ColumnSpec, Row } from './schema'

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

const literal = (value: string | number | boolean | null) =>
  typeof value === 'string' ? str(value) : String(value)

const ALIGN_HELPERS = `
const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const
type Align = keyof typeof alignClass

// Alignment is set per column in \`meta: { align }\`
const alignOf = (def: { meta?: unknown }): Align =>
  (def.meta as { align?: Align } | undefined)?.align ?? 'left'
`
const JUSTIFY_ALIGN = `
// Sort buttons fill the header, so their content is aligned with flex
const justifyClass = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const
`
const SKELETON_ALIGN = `
const skeletonClass = {
  left: '',
  center: 'mx-auto',
  right: 'ml-auto',
} as const
`

/** Which optional pieces a state needs. The generator, the preview and the
 * dependency list all read this, so they agree on what is in the table. */
export function capabilities(state: BuilderState) {
  const has = (feature: BuilderState['features'][number]) =>
    state.features.includes(feature)
  const { columns } = state
  const editableColumns = columns.filter((c) => isEditable(c, has('editing')))
  const rowActions = has('rowActions') && state.actions.length > 0
  return {
    has,
    filters: has('filters') && columns.length > 0,
    editableColumns,
    editing: editableColumns.length > 0,
    rowActions,
    /** The table keeps its own copy of the rows because cells or actions change them */
    mutating:
      editableColumns.length > 0 ||
      (rowActions &&
        (state.actions.includes('duplicate') ||
          state.actions.includes('delete'))),
    visibility: has('columnVisibility') && columns.length > 0,
    pinning: has('pinning') && columns.length > 0,
    exporting: has('export') && columns.length > 0,
  }
}

/** The pinning a table starts with: the builder's pins, plus the checkbox and
 * action columns riding along at the edges they sit on */
export function initialPinning(state: BuilderState) {
  const { has, rowActions } = capabilities(state)
  const left = state.columns.filter((c) => c.pin === 'left').map((c) => c.id)
  const right = state.columns.filter((c) => c.pin === 'right').map((c) => c.id)
  return {
    left: has('selection') && left.length ? ['select', ...left] : left,
    right: rowActions ? [...right, 'actions'] : right,
  }
}

export interface GenerateOptions {
  /** The user's imported rows for data.ts. Without them it gets sample rows. */
  rows?: Row[]
}

export function generate(
  state: BuilderState,
  options: GenerateOptions = {},
): GeneratedFile[] {
  const caps = capabilities(state)
  const { has, filters, editing, rowActions, mutating, visibility, pinning } =
    caps
  const exporting = caps.exporting
  const { columns } = state
  const hasType = (type: ColumnSpec['type']) =>
    columns.some((c) => c.type === type)
  const displays = (type: ColumnSpec['type']) =>
    columns.some(
      (c) =>
        c.type === type &&
        // An editable checkbox is a Checkbox, not a Check icon
        !(type === 'checkbox' && caps.editableColumns.includes(c)),
    )
  const aligned = columns.some((c) => effectiveAlign(c) !== 'left')
  const imported = options.rows !== undefined
  // Only part of a large import is written out; the type follows that part
  const dataRows = imported
    ? (options.rows ?? []).slice(0, MAX_EMBEDDED_ROWS)
    : buildRows(columns)
  // Number columns with empty cells in the data are typed `number | null`
  const nullable = new Set(
    columns
      .filter((c) => dataRows.some((row) => row[c.id] === null))
      .map((c) => c.id),
  )
  const { states } = state
  const skeleton = states.loadingStyle === 'skeleton'
  const pins = initialPinning(state)
  const pinned = pinning && (pins.left.length > 0 || pins.right.length > 0)

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
  if (editing) {
    files.push({ path: `${DIR}/editable-cell.tsx`, code: editableCellSource })
  }
  if (rowActions) {
    files.push({ path: `${DIR}/row-actions.tsx`, code: rowActionsSource })
  }
  if (visibility || pinning) {
    files.push({
      path: `${DIR}/column-controls.tsx`,
      code: columnControlsSource,
    })
  }
  if (exporting) {
    files.push({ path: `${DIR}/export-menu.tsx`, code: exportMenuSource })
  }
  return files

  function columnsFile() {
    const imports = [
      `import type { ColumnDef } from '@tanstack/react-table'`,
      displays('checkbox') && `import { Check } from 'lucide-react'`,
      hasType('select') && `import { Badge } from '#/components/ui/badge'`,
      has('selection') && `import { Checkbox } from '#/components/ui/checkbox'`,
      editing && `import { EditableCell } from './editable-cell'`,
      filters && `import type { FacetDef, Field, Preset } from './filters'`,
      rowActions && `import { RowActions } from './row-actions'`,
      `import type { Row } from './data'`,
    ].filter(Boolean)
    // Pinned tables are laid out from TanStack's column sizes
    const fixed = pinning
      ? `
    enablePinning: false,`
      : ''

    const entries = [
      has('selection') &&
        `  {
    id: 'select',
    enableSorting: false,
    enableHiding: false,${fixed}${
      pinning
        ? `
    size: 40,`
        : ''
    }
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
      ...columns.map((c) =>
        columnCode(c, {
          editable: caps.editableColumns.includes(c),
          sized: pinning,
          nullable: nullable.has(c.id),
        }),
      ),
      rowActions &&
        `  {
    id: 'actions',
    enableSorting: false,
    enableHiding: false,${fixed}${
      pinning
        ? `
    size: 56,`
        : ''
    }
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row, table }) => (
      <RowActions
        row={row}
        table={table}
        actions={[${state.actions.map(str).join(', ')}]}
      />
    ),
  },`,
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
  displays('date')
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
    const type = `export type Row = {
  id: string
${columns.map((c) => `  ${c.id}: ${tsType(c)}${nullable.has(c.id) ? ' | null' : ''}`).join('\n')}
}`
    const total = options.rows?.length ?? 0
    const note = !imported
      ? '// Sample data. Replace it with your own rows (or a fetch) of the same shape.'
      : total > dataRows.length
        ? `// The first ${dataRows.length} of your ${total} imported rows. Load the rest\n// from your API (or a fetch) in the same shape.`
        : '// Your imported rows. Swap them for a fetch from your API when you are ready.'
    const body = dataRows
      .map(
        (row) =>
          `  {\n${Object.entries(row)
            .map(([key, value]) => `    ${key}: ${literal(value)},`)
            .join('\n')}\n  },`,
      )
      .join('\n')
    return `${type}

${note}
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
    const stateful = has('search') || has('sorting') || mutating
    const react = [
      (stateful || filters) && 'useState',
      filters && 'useMemo',
    ].filter(Boolean)
    const footer = has('pagination') || has('selection')
    const tools = visibility || exporting
    const toolbar = has('search') || filters || tools
    // Rows in local state, when cells or actions change them
    const source = mutating ? 'tableData' : 'data'
    const constraint = [
      filters && 'Record<string, unknown>',
      mutating && '{ id: string }',
    ]
      .filter(Boolean)
      .join(' & ')
    const generic = constraint ? `TData extends ${constraint}` : 'TData'
    const initialState = [
      has('pagination') && 'pagination: { pageSize: 5 }',
      pinned &&
        `columnPinning: {${
          pins.left.length
            ? ` left: [${pins.left.map(str).join(', ')}]${pins.right.length ? ',' : ''}`
            : ''
        }${pins.right.length ? ` right: [${pins.right.map(str).join(', ')}]` : ''} }`,
    ].filter(Boolean)
    const controls = [
      visibility && 'ColumnsMenu',
      pinning && 'PinControls',
      pinning && 'pinClass',
      pinning && 'pinStyles',
    ].filter(Boolean)
    // Pinned cells need an opaque background; `pinClass` adds it
    const cellClass = (target: string) =>
      aligned && pinning
        ? ` className={\`\${alignClass[alignOf(${target}.columnDef)]} \${pinClass(${target})}\`}`
        : aligned
          ? ` className={alignClass[alignOf(${target}.columnDef)]}`
          : pinning
            ? ` className={pinClass(${target})}`
            : ''
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
${controls.length ? `import { ${controls.join(', ')} } from './column-controls'\n` : ''}${exporting ? `import { ExportMenu } from './export-menu'\n` : ''}${aligned ? ALIGN_HELPERS : ''}${aligned && has('sorting') ? JUSTIFY_ALIGN : ''}${aligned && skeleton ? SKELETON_ALIGN : ''}${filters ? `import { FilterBar } from './filter-bar'\nimport { applyFacets, applyRules } from './filters'\nimport type { FacetDef, FacetValue, Field, Preset } from './filters'\n` : ''}
interface DataTableProps<${generic}, TValue> {
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

export function DataTable<${generic}, TValue>({
  columns,
  data,
  isLoading = false,${filters ? '\n  fields,\n  facets,\n  presets,' : ''}
}: DataTableProps<TData, TValue>) {
${has('sorting') ? `  const [sorting, setSorting] = useState<SortingState>([])\n` : ''}${has('search') ? `  const [globalFilter, setGlobalFilter] = useState('')\n` : ''}${mutating ? mutationCode() : ''}${
      filters
        ? `  const [facetValues, setFacetValues] = useState<Record<string, FacetValue>>({})
  const [activePresets, setActivePresets] = useState<string[]>([])

  // Facets and quick filters narrow the data before the table sees it
  const rows = useMemo(() => {
    const rules = presets
      .filter((p) => activePresets.includes(p.id))
      .map((p) => p.rule)
    return applyRules(applyFacets(${source}, facets, facetValues), fields, rules)
  }, [${source}, fields, facets, presets, facetValues, activePresets])
`
        : ''
    }
  const table = useReactTable({
    data: ${filters ? 'rows' : source},
    columns,
${rowModels.map((n) => `    ${n}: ${n}(),`).join('\n')}
${mutating ? `    // Rows keep their identity through edits, sorting and deletes\n    getRowId: (row) => row.id,\n    meta,\n` : ''}${initialState.length ? `    initialState: { ${initialState.join(', ')} },\n` : ''}${has('sorting') ? `    onSortingChange: setSorting,\n` : ''}${has('search') ? `    onGlobalFilterChange: setGlobalFilter,\n` : ''}${tableState.length ? `    state: { ${tableState.join(', ')} },\n` : ''}  })

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
          data={${source}}
          values={facetValues}
          onValuesChange={setFacetValues}
          activePresets={activePresets}
          onActivePresetsChange={setActivePresets}
        />\n`
          : ''
      }${
        tools
          ? `        <div className="ml-auto flex items-center gap-2">
${visibility ? `          <ColumnsMenu table={table} />\n` : ''}${
              exporting
                ? `          <ExportMenu
            table={table}
            formats={[${state.exporting.formats.map(str).join(', ')}]}
            filename={${str(exportFilename(state.exporting))}}
          />\n`
                : ''
            }        </div>\n`
          : ''
      }      </div>
`
    : ''
}      <div className="overflow-x-auto rounded-md border" aria-busy={isLoading}>
        <Table${
          pinning
            ? `
          // Fixed widths keep the pinned offsets exact once the table scrolls
          className="table-fixed"
          style={{ minWidth: table.getTotalSize() }}
        `
            : ''
        }>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}${
                      pinning
                        ? aligned
                          ? `
                    className={\`group/head \${alignClass[alignOf(header.column.columnDef)]} \${pinClass(header.column)}\`}
                    style={pinStyles(header.column)}`
                          : `
                    className={\`group/head \${pinClass(header.column)}\`}
                    style={pinStyles(header.column)}`
                        : aligned
                          ? `
                    className={alignClass[alignOf(header.column.columnDef)]}`
                          : ''
                    }
                  >
${pinning ? pinnedHeaderBody() : headerBody()}
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
                    <TableCell
                      key={cell.id}${cellClass('cell.column')}${pinning ? `\n                      style={pinStyles(cell.column)}` : ''}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
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

  function mutationCode() {
    const dup = rowActions && state.actions.includes('duplicate')
    const del = rowActions && state.actions.includes('delete')
    const fns = [
      editing &&
        `    updateCell: (rowId: string, columnId: string, value: unknown) =>
      setTableData((prev) =>
        prev.map((row) =>
          row.id === rowId ? { ...row, [columnId]: value } : row,
        ),
      ),`,
      dup &&
        `    duplicateRow: (rowId: string) =>
      setTableData((prev) => {
        const index = prev.findIndex((row) => row.id === rowId)
        if (index < 0) return prev
        const copy = { ...prev[index], id: \`\${rowId}-\${Date.now().toString(36)}\` }
        return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)]
      }),`,
      del &&
        `    deleteRow: (rowId: string) =>
      setTableData((prev) => prev.filter((row) => row.id !== rowId)),`,
    ].filter(Boolean)
    return `  // The table keeps its own copy of the rows so changes show up right
  // away. Send them to your backend here too.
  const [tableData, setTableData] = useState(data)
  const meta = {
${fns.join('\n')}
  }
`
  }

  function pinnedHeaderBody() {
    const inner = headerBody()
      .split('\n')
      .map((line) => `    ${line}`)
      .join('\n')
    return `                    <div className="flex items-center gap-1">
                      <div className="min-w-0 flex-1">
${inner}
                      </div>
                      <PinControls column={header.column} />
                    </div>`
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
  const caps = capabilities(state)
  const { filters, rowActions, visibility, pinning, exporting } = caps
  const edits = (type: ColumnSpec['type']) =>
    caps.editableColumns.some((c) => c.type === type)
  const menus = rowActions || visibility || exporting
  if (state.features.includes('pagination') || filters || menus || pinning) {
    parts.push('button')
  }
  if (
    state.features.includes('search') ||
    filters ||
    edits('text') ||
    edits('number') ||
    edits('date')
  ) {
    parts.push('input')
  }
  if (state.features.includes('selection') || filters || edits('checkbox')) {
    parts.push('checkbox')
  }
  if (filters) parts.push('popover')
  if (menus) parts.push('dropdown-menu')
  if (edits('select')) parts.push('select')
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
