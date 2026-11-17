'use client'

import { useState, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { LoaderCircle, ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { ColumnsMenu, PinControls, pinClass, pinStyles } from './column-controls'
import { ExportMenu } from './export-menu'

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const
type Align = keyof typeof alignClass

// Alignment is set per column in `meta: { align }`
const alignOf = (def: { meta?: unknown }): Align =>
  (def.meta as { align?: Align } | undefined)?.align ?? 'left'

// Sort buttons fill the header, so their content is aligned with flex
const justifyClass = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const
import { FilterBar } from './filter-bar'
import { applyFacets, applyRules } from './filters'
import type { FacetDef, FacetValue, Field, Preset } from './filters'

interface DataTableProps<TData extends Record<string, unknown> & { id: string }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Shows the loading state instead of rows */
  isLoading?: boolean
  fields: Field[]
  facets: FacetDef[]
  presets: Preset[]
}

export function DataTable<TData extends Record<string, unknown> & { id: string }, TValue>({
  columns,
  data,
  isLoading = false,
  fields,
  facets,
  presets,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  // The table keeps its own copy of the rows so changes show up right
  // away. Send them to your backend here too.
  const [tableData, setTableData] = useState(data)
  const meta = {
    updateCell: (rowId: string, columnId: string, value: unknown) =>
      setTableData((prev) =>
        prev.map((row) =>
          row.id === rowId ? { ...row, [columnId]: value } : row,
        ),
      ),
    duplicateRow: (rowId: string) =>
      setTableData((prev) => {
        const index = prev.findIndex((row) => row.id === rowId)
        if (index < 0) return prev
        const copy = { ...prev[index], id: `${rowId}-${Date.now().toString(36)}` }
        return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)]
      }),
    deleteRow: (rowId: string) =>
      setTableData((prev) => prev.filter((row) => row.id !== rowId)),
  }
  const [facetValues, setFacetValues] = useState<Record<string, FacetValue>>({})
  const [activePresets, setActivePresets] = useState<string[]>([])

  // Facets and quick filters narrow the data before the table sees it
  const rows = useMemo(() => {
    const rules = presets
      .filter((p) => activePresets.includes(p.id))
      .map((p) => p.rule)
    return applyRules(applyFacets(tableData, facets, facetValues), fields, rules)
  }, [tableData, fields, facets, presets, facetValues, activePresets])

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Rows keep their identity through edits, sorting and deletes
    getRowId: (row) => row.id,
    meta,
    initialState: { pagination: { pageSize: 5 }, columnPinning: { left: ['select', 'name'], right: ['due', 'actions'] } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter },
  })

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="w-full sm:w-72"
        />
        <FilterBar
          fields={fields}
          facets={facets}
          presets={presets}
          data={tableData}
          values={facetValues}
          onValuesChange={setFacetValues}
          activePresets={activePresets}
          onActivePresetsChange={setActivePresets}
        />
        <div className="ml-auto flex items-center gap-2">
          <ColumnsMenu table={table} />
          <ExportMenu
            table={table}
            formats={['csv', 'excel']}
            filename={'table-export'}
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border" aria-busy={isLoading}>
        <Table
          // Fixed widths keep the pinned offsets exact once the table scrolls
          className="table-fixed"
          style={{ minWidth: table.getTotalSize() }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`group/head ${alignClass[alignOf(header.column.columnDef)]} ${pinClass(header.column)}`}
                    style={pinStyles(header.column)}
                  >
                    <div className="flex items-center gap-1">
                      <div className="min-w-0 flex-1">
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className={`flex w-full cursor-pointer items-center gap-2 select-none ${justifyClass[alignOf(header.column.columnDef)]}`}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </div>
                      <PinControls column={header.column} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
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
                    {'Loading...'}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id} className={`${alignClass[alignOf(cell.column.columnDef)]} ${pinClass(cell.column)}`}
                      style={pinStyles(cell.column)}
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
                  <p className="text-sm font-medium">{'No results'}</p>
                  <p className="text-sm text-muted-foreground">
                    {'Try changing your search or filters.'}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-3">
        <p className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            Next
          </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
