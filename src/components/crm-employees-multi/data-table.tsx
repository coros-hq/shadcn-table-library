'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  Column,
  ColumnDef,
  FilterFn,
  SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, X } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { MultiSelectFilter } from './multi-select-filter'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
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
import type { Employee } from './data'

type Density = 'compact' | 'comfortable' | 'spacious'

// Padding and type size live on the cells, so every column follows the toggle
// without its own cell renderer knowing about density.
const densityCell: Record<Density, string> = {
  compact: 'py-1 text-xs',
  comfortable: 'py-2 text-sm',
  spacious: 'py-4 text-base',
}

const densityHead: Record<Density, string> = {
  compact: 'h-8 text-xs',
  comfortable: 'h-10 text-sm',
  spacious: 'h-14 text-base',
}

// Searches the fields a person would actually type: name, email, role,
// department and location — not just the columns that happen to be strings.
const employeeSearch: FilterFn<Employee> = (row, _columnId, value) => {
  const query = String(value).trim().toLowerCase()
  if (!query) return true
  const { name, email, role, department, location } = row.original
  return [name, email, role, department, location].some((field) =>
    field.toLowerCase().includes(query),
  )
}

// Bridges a column's filter value (string[] | undefined) to MultiSelectFilter.
// Counts come from the faceted model, which ignores this column's own filter,
// so the numbers stay meaningful while you are still picking options.
function ColumnMultiSelect<TData>({
  column,
  title,
  options,
}: {
  column?: Column<TData, unknown>
  title: string
  options: string[]
}) {
  const facets = column?.getFacetedUniqueValues()
  return (
    <MultiSelectFilter
      title={title}
      options={options.map((option) => ({
        label: option,
        value: option,
        count: facets?.get(option) ?? 0,
      }))}
      selected={(column?.getFilterValue() as string[] | undefined) ?? []}
      // An empty array would still count as an active filter and hide every
      // row, so clearing the last option removes the filter entirely.
      onChange={(values) =>
        column?.setFilterValue(values.length ? values : undefined)
      }
    />
  )
}

interface DataTableProps<TValue> {
  columns: ColumnDef<Employee, TValue>[]
  data: Employee[]
  departments: string[]
  statuses: string[]
}

export function DataTable<TValue>({
  columns,
  data,
  departments,
  statuses,
}: DataTableProps<TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [density, setDensity] = useState<Density>('comfortable')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: employeeSearch,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getRowId: (row) => row.id,
    initialState: {
      pagination: { pageSize: 10 },
      // Department is rendered under Role, so its own column stays hidden
      // while still being filterable from the toolbar.
      columnVisibility: { department: false },
    },
    state: { sorting, globalFilter },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const filteredCount = table.getFilteredRowModel().rows.length
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, filteredCount)

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          type="search"
          placeholder="Search name, email, role, location..."
          aria-label="Search employees"
          value={globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="w-full sm:w-72"
        />
        <ColumnMultiSelect
          column={table.getColumn('department')}
          title="Department"
          options={departments}
        />
        <ColumnMultiSelect
          column={table.getColumn('status')}
          title="Status"
          options={statuses}
        />
        {table.getState().columnFilters.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X className="h-4 w-4" />
          </Button>
        ) : null}
        <Select
          value={density}
          onValueChange={(value) => setDensity(value as Density)}
        >
          <SelectTrigger className="w-40 sm:ml-auto" aria-label="Row density">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead
                      key={header.id}
                      className={densityHead[density]}
                      aria-sort={
                        sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                            ? 'descending'
                            : undefined
                      }
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap select-none"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === 'asc' ? (
                            <ArrowUp className="h-3 w-3 shrink-0" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="h-3 w-3 shrink-0" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 shrink-0 opacity-50" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
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
                    <TableCell key={cell.id} className={densityCell[density]}>
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
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
                  No employees match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 py-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {selectedCount > 0 ? `${selectedCount} selected · ` : null}
          Showing {from}–{to} of {filteredCount} employees
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground">
            Page {pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
