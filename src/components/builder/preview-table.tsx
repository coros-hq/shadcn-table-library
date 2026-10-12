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
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { columnDef } from './column-types'
import { FilterBar } from './filter-bar'
import { applyRules } from './filters'
import type { FilterRule } from './filters'
import { buildRows } from './schema'
import type { BuilderState, Row } from './schema'
import { alignClass, alignOf, justifyClass } from './align'

const selectColumn: ColumnDef<Row> = {
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
}

// Mirrors what generate.ts emits, so the preview is the generated table.
export function PreviewTable({
  state,
  onFiltersChange,
}: {
  state: BuilderState
  onFiltersChange: (filters: FilterRule[]) => void
}) {
  const has = (feature: BuilderState['features'][number]) =>
    state.features.includes(feature)
  const filters = has('filters') && state.columns.length > 0
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const selection = has('selection')
  const columns = useMemo(
    () => [
      ...(selection ? [selectColumn] : []),
      ...state.columns.map(columnDef),
    ],
    [selection, state.columns],
  )
  const baseRows = useMemo(() => buildRows(state.columns), [state.columns])
  const data = useMemo(
    () =>
      filters ? applyRules(baseRows, state.columns, state.filters) : baseRows,
    [filters, baseRows, state.columns, state.filters],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(has('search') && { getFilteredRowModel: getFilteredRowModel() }),
    ...(has('pagination') && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
    ...(has('sorting') && { getSortedRowModel: getSortedRowModel() }),
    initialState: { pagination: { pageSize: has('pagination') ? 5 : 1000 } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting: has('sorting') ? sorting : [],
      globalFilter: has('search') ? globalFilter : '',
    },
  })

  const footer = has('pagination') || has('selection')

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
      {has('search') || filters ? (
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
              rules={state.filters}
              onChange={onFiltersChange}
            />
          ) : null}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const content = flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )
                  return (
                    <TableHead
                      key={header.id}
                      className={alignClass[alignOf(header.column.columnDef)]}
                    >
                      {header.isPlaceholder ? null : has('sorting') &&
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
                      )}
                    </TableHead>
                  )
                })}
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
                    <TableCell
                      key={cell.id}
                      className={alignClass[alignOf(cell.column.columnDef)]}
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
                  colSpan={Math.max(columns.length, 1)}
                  className="h-24 text-center"
                >
                  {state.columns.length
                    ? 'No results.'
                    : 'Add a column to get started.'}
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
            <div className="flex items-center gap-2">
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
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
