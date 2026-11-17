'use client'

import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LoaderCircle,
} from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { columnDef, isEditable } from './column-types'
import {
  ColumnsMenu,
  PinControls,
  pinClass,
  pinStyles,
} from './column-controls'
import type { EditMeta } from './editable-cell'
import { ExportMenu } from './export-menu'
import { FilterBar } from './filter-bar'
import { applyFacets, applyRules } from './filters'
import type { FacetValue } from './filters'
import { capabilities, initialPinning } from './generate'
import { RowActions } from './row-actions'
import type { RowActionsMeta } from './row-actions'
import { PAGE_SIZES, buildRows, exportFilename } from './schema'
import type { BuilderState, Row } from './schema'
import { alignClass, alignOf, justifyClass } from './align'
import type { PreviewView } from './states-editor'

const skeletonClass = { left: '', center: 'mx-auto', right: 'ml-auto' } as const

const selectColumn: ColumnDef<Row> = {
  id: 'select',
  enableSorting: false,
  enableHiding: false,
  enablePinning: false,
  size: 40,
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
}

// Mirrors what generate.ts emits, so the preview is the generated table.
export function PreviewTable({
  state,
  view = 'data',
  rows,
}: {
  state: BuilderState
  /** The user's imported rows, already typed by the columns; sample rows otherwise */
  rows?: Row[]
  /** Forces the loading or empty state so it can be seen without real data */
  view?: PreviewView
}) {
  const caps = capabilities(state)
  const { has, filters, rowActions, visibility, pinning, exporting } = caps
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [facetValues, setFacetValues] = useState<Record<string, FacetValue>>({})
  const [activePresets, setActivePresets] = useState<string[]>([])

  const selection = has('selection')
  const editing = has('editing')
  const actions = state.actions
  const columns = useMemo(
    () => [
      ...(selection ? [selectColumn] : []),
      ...state.columns.map((c) =>
        columnDef(c, {
          editable: isEditable(c, editing),
          sized: pinning,
        }),
      ),
      ...(rowActions
        ? [
            {
              id: 'actions',
              enableSorting: false,
              enableHiding: false,
              enablePinning: false,
              size: 56,
              header: () => <span className="sr-only">Actions</span>,
              cell: ({ row, table }) => (
                <RowActions row={row} table={table} actions={actions} />
              ),
            } satisfies ColumnDef<Row>,
          ]
        : []),
    ],
    [selection, state.columns, editing, pinning, rowActions, actions],
  )
  const baseRows = useMemo(
    () => rows ?? buildRows(state.columns),
    [rows, state.columns],
  )

  // Edits and row actions change a local copy, like the generated table does.
  // A schema change brings in fresh sample rows.
  const [tableData, setTableData] = useState(baseRows)
  const [prevBase, setPrevBase] = useState(baseRows)
  if (prevBase !== baseRows) {
    setPrevBase(baseRows)
    setTableData(baseRows)
  }
  const meta: EditMeta & RowActionsMeta = {
    updateCell: (rowId, columnId, value) =>
      setTableData((prev) =>
        prev.map((row) =>
          row.id === rowId ? { ...row, [columnId]: value as Row[string] } : row,
        ),
      ),
    duplicateRow: (rowId) =>
      setTableData((prev) => {
        const index = prev.findIndex((row) => row.id === rowId)
        if (index < 0) return prev
        const copy = {
          ...prev[index],
          id: `${rowId}-${Date.now().toString(36)}`,
        }
        return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)]
      }),
    deleteRow: (rowId) =>
      setTableData((prev) => prev.filter((row) => row.id !== rowId)),
  }

  const data = useMemo(() => {
    if (view === 'empty') return []
    if (!filters) return tableData
    const rules = state.presets
      .filter((p) => activePresets.includes(p.id))
      .map((p) => p.rule)
    return applyRules(
      applyFacets(tableData, state.facets, facetValues),
      state.columns,
      rules,
    )
  }, [
    view,
    filters,
    tableData,
    state.columns,
    state.facets,
    state.presets,
    facetValues,
    activePresets,
  ])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(has('search') && { getFilteredRowModel: getFilteredRowModel() }),
    ...(has('pagination') && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
    ...(has('sorting') && { getSortedRowModel: getSortedRowModel() }),
    getRowId: (row) => String(row.id),
    meta,
    initialState: {
      pagination: { pageSize: has('pagination') ? 5 : 1000 },
      ...(pinning && { columnPinning: initialPinning(state) }),
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting: has('sorting') ? sorting : [],
      globalFilter: has('search') ? globalFilter : '',
    },
  })

  const footer = has('pagination') || has('selection')
  const { states } = state
  const isLoading = view === 'loading'

  // Rows with no cells would render as blank lines
  if (state.columns.length === 0) {
    return (
      <p className="rounded-md border border-dashed px-3 py-10 text-center text-sm text-muted-foreground">
        Add a column to get started.
      </p>
    )
  }

  return (
    <div>
      {has('search') || filters || visibility || exporting ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {has('search') ? (
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              className="w-full sm:w-72"
            />
          ) : null}
          {filters ? (
            <FilterBar
              fields={state.columns}
              facets={state.facets}
              presets={state.presets}
              data={tableData}
              values={facetValues}
              onValuesChange={setFacetValues}
              activePresets={activePresets}
              onActivePresetsChange={setActivePresets}
            />
          ) : null}
          {visibility || exporting ? (
            <div className="ml-auto flex items-center gap-2">
              {visibility ? <ColumnsMenu table={table} /> : null}
              {exporting ? (
                <ExportMenu
                  table={table}
                  formats={state.exporting.formats}
                  filename={exportFilename(state.exporting)}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-md border" aria-busy={isLoading}>
        <Table
          className={pinning ? 'table-fixed' : undefined}
          style={pinning ? { minWidth: table.getTotalSize() } : undefined}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const content = flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )
                  const body = header.isPlaceholder ? null : has('sorting') &&
                    header.column.getCanSort() ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className={`flex w-full cursor-pointer items-center gap-2 select-none ${justifyClass[alignOf(header.column.columnDef)]}`}
                    >
                      {content}
                      {header.column.getIsSorted() === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    content
                  )
                  return (
                    <TableHead
                      key={header.id}
                      className={`${alignClass[alignOf(header.column.columnDef)]} ${
                        pinning ? `group/head ${pinClass(header.column)}` : ''
                      }`}
                      style={pinning ? pinStyles(header.column) : undefined}
                    >
                      {pinning ? (
                        <div className="flex items-center gap-1">
                          <div className="min-w-0 flex-1">{body}</div>
                          <PinControls column={header.column} />
                        </div>
                      ) : (
                        body
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              states.loadingStyle === 'skeleton' ? (
                Array.from({ length: states.loadingRows }, (_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {table.getVisibleLeafColumns().map((column, index) => (
                      <TableCell key={column.id}>
                        {rowIndex === 0 &&
                        index === 0 &&
                        states.loadingMessage.trim() ? (
                          <span role="status" className="sr-only">
                            {states.loadingMessage}
                          </span>
                        ) : null}
                        <Skeleton
                          className={`h-4 w-3/4 ${skeletonClass[alignOf(column.columnDef)]}`}
                        />
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
                    <div
                      role="status"
                      className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                    >
                      <LoaderCircle className="size-4 animate-spin" />
                      {states.loadingMessage}
                    </div>
                  </TableCell>
                </TableRow>
              )
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`${alignClass[alignOf(cell.column.columnDef)]} ${
                        pinning ? pinClass(cell.column) : ''
                      }`}
                      style={pinning ? pinStyles(cell.column) : undefined}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={Math.max(table.getVisibleLeafColumns().length, 1)}
                  className="h-24 text-center"
                >
                  {states.emptyTitle.trim() ||
                  states.emptyDescription.trim() ? (
                    <>
                      {states.emptyTitle.trim() ? (
                        <p className="text-sm font-medium">
                          {states.emptyTitle}
                        </p>
                      ) : null}
                      {states.emptyDescription.trim() ? (
                        <p className="text-sm text-muted-foreground">
                          {states.emptyDescription}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No results.</p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {footer ? (
        <div className="flex items-center justify-between py-3">
          {has('selection') ? (
            <p className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected
            </p>
          ) : (
            <span />
          )}
          {has('pagination') ? (
            <div className="flex items-center gap-4">
              {state.pager.sizeSelect ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Rows per page
                  </span>
                  <Select
                    value={String(table.getState().pagination.pageSize)}
                    onValueChange={(value) => table.setPageSize(Number(value))}
                  >
                    <SelectTrigger size="sm" aria-label="Rows per page">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              {state.pager.style === 'arrows' ? (
                <span className="text-sm text-muted-foreground">
                  Page {table.getState().pagination.pageIndex + 1} of{' '}
                  {Math.max(table.getPageCount(), 1)}
                </span>
              ) : null}
              <div className="flex items-center gap-2">
                {state.pager.style === 'arrows' ? (
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="First page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  size={state.pager.style === 'arrows' ? 'icon' : 'sm'}
                  className={state.pager.style === 'arrows' ? 'size-8' : ''}
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label="Previous page"
                >
                  {state.pager.style === 'arrows' ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    'Previous'
                  )}
                </Button>
                <Button
                  variant="outline"
                  size={state.pager.style === 'arrows' ? 'icon' : 'sm'}
                  className={state.pager.style === 'arrows' ? 'size-8' : ''}
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label="Next page"
                >
                  {state.pager.style === 'arrows' ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    'Next'
                  )}
                </Button>
                {state.pager.style === 'arrows' ? (
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    aria-label="Last page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
