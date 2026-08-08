'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'

import type { ColumnDef, ColumnFiltersState } from '@tanstack/react-table'
import type { DateRange } from 'react-day-picker'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { MultiSelectFilter } from '#/components/ui/multiple-select-filter'
import { ActiveFilterChips } from './active-filter-chips'
import type { ActiveFilter } from './type'

interface FilterOption {
  value: string
  label: string
}

interface FilterStateShapeDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  categoryOptions: FilterOption[]
}

export function FilterStateShapeDataTable<TData, TValue>({
  columns,
  data,
  categoryOptions,
}: FilterStateShapeDataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [filters, setFilters] = useState<ActiveFilter[]>([])

  const categoryFilter = filters.find(
    (f): f is Extract<ActiveFilter, { type: 'multiSelect' }> =>
      f.type === 'multiSelect' && f.columnId === 'category',
  )
  const dueDateFilter = filters.find(
    (f): f is Extract<ActiveFilter, { type: 'dateRange' }> =>
      f.type === 'dateRange' && f.columnId === 'dueDate',
  )

  function setCategoryValues(values: string[]) {
    setFilters((prev) => {
      const rest = prev.filter((f) => f.columnId !== 'category')
      if (values.length === 0) return rest
      return [...rest, { type: 'multiSelect', columnId: 'category', values }]
    })
  }

  function setDueDateRange(range: DateRange | undefined) {
    setFilters((prev) => {
      const rest = prev.filter((f) => f.columnId !== 'dueDate')
      if (!range?.from && !range?.to) return rest
      return [
        ...rest,
        {
          type: 'dateRange',
          columnId: 'dueDate',
          from: range.from,
          to: range.to,
        },
      ]
    })
  }

  function removeFilter(columnId: string) {
    setFilters((prev) => prev.filter((f) => f.columnId !== columnId))
  }

  function clearAll() {
    setFilters([])
  }

  // `filters` is the single source of truth for structured filters — it
  // drives both the toolbar controls and the chips row. columnFilters is
  // derived from it rather than owned by the table.
  const columnFilters = useMemo<ColumnFiltersState>(
    () =>
      filters.map((f) =>
        f.type === 'multiSelect'
          ? { id: f.columnId, value: f.values }
          : { id: f.columnId, value: { from: f.from, to: f.to } },
      ),
    [filters],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      columnFilters,
      globalFilter,
    },
  })

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search tasks..."
          value={globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="w-full sm:w-64"
        />
        <MultiSelectFilter
          title="Category"
          options={categoryOptions}
          selected={categoryFilter?.values ?? []}
          onChange={setCategoryValues}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDateFilter?.from ? (
                dueDateFilter.to ? (
                  <>
                    {format(dueDateFilter.from, 'MMM d')} –{' '}
                    {format(dueDateFilter.to, 'MMM d')}
                  </>
                ) : (
                  format(dueDateFilter.from, 'MMM d')
                )
              ) : (
                'Due date'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={dueDateFilter?.from}
              selected={
                dueDateFilter
                  ? { from: dueDateFilter.from, to: dueDateFilter.to }
                  : undefined
              }
              onSelect={setDueDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="mb-3">
        <ActiveFilterChips
          filters={filters}
          onRemove={removeFilter}
          onClearAll={clearAll}
        />
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
