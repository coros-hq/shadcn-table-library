'use client'

import { useState } from 'react'
import {
  flexRender,
  useTable,
} from '@tanstack/react-table-v9'

import type {
  Column,
  ColumnDef,
  ColumnFiltersState, RowData} from '@tanstack/react-table-v9'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { v9Features, type V9Features } from '#/lib/table-v9-features.ts'

interface FilterOption {
  value: string
  label: string
}

interface ToolbarSelectProps<TData extends RowData> {
  column?: Column<V9Features, TData, unknown>
  placeholder: string
  options: FilterOption[]
}

function ToolbarSelect<TData extends RowData>({
  column,
  placeholder,
  options,
}: ToolbarSelectProps<TData>) {
  const value = (column?.getFilterValue() as string | undefined) ?? 'all'

  return (
    <Select
      value={value}
      onValueChange={(next) =>
        column?.setFilterValue(next === 'all' ? undefined : next)
      }
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">All {placeholder.toLowerCase()}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

interface ToolbarFilterDataTableProps<TData extends RowData> {
  columns: ColumnDef<V9Features, TData, any>[]
  data: TData[]
  categoryOptions: FilterOption[]
  statusOptions: FilterOption[]
}

export function ToolbarFilterDataTable<TData extends RowData>({
  columns,
  data,
  categoryOptions,
  statusOptions,
}: ToolbarFilterDataTableProps<TData>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useTable({
    features: v9Features,
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
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
        <ToolbarSelect
          column={table.getColumn('category')}
          placeholder="Category"
          options={categoryOptions}
        />
        <ToolbarSelect
          column={table.getColumn('status')}
          placeholder="Status"
          options={statusOptions}
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
