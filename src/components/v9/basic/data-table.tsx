'use client'

import { useTable } from '@tanstack/react-table-v9'

import type {
  ColumnDef,
  ColumnFiltersState,
  RowData,
  SortingState,
  Table as ReactTable,
} from '@tanstack/react-table-v9'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table'
import { useState } from 'react'
import { Button } from '../../ui/button'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select'
import { Input } from '../../ui/input'
import { v9Features, type V9Features } from '#/lib/table-v9-features.ts'

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<V9Features, TData, any>[]
  data: TData[]
  filters?: (table: ReactTable<V9Features, TData>) => React.ReactNode
}

const PAGES_SIZE = [
  {
    label: '10',
    value: '10',
  },
  {
    label: '20',
    value: '20',
  },
  {
    label: '30',
    value: '30',
  },
  {
    label: '40',
    value: '40',
  },
  {
    label: '50',
    value: '50',
  },
]

export function DataTable<TData extends RowData>({
  columns,
  data,
  filters,
}: DataTableProps<TData>) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useTable({
    features: v9Features,
    data,
    columns,
    onPaginationChange: setPagination,
    state: {
      pagination,
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Input
          type="text"
          placeholder={'Search...'}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="filter-input w-full sm:w-64"
        />
        <div className="flex flex-wrap items-center gap-2">
          {table.state.columnFilters.length > 0 ? (
            <Button
              variant="link"
              className="underline"
              onClick={() => {
                table.resetColumnFilters()
              }}
            >
              Clear Filters <X className="h-3 w-3" />
            </Button>
          ) : null}
          {filters?.(table)}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortHandler = header.column.getToggleSortingHandler()
                  return (
                    <TableHead
                      key={header.id}
                      onClick={sortHandler}
                      onKeyDown={(e) => {
                        if (canSort && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          sortHandler?.(e)
                        }
                      }}
                      tabIndex={canSort ? 0 : undefined}
                      role={canSort ? 'button' : undefined}
                      className={
                        canSort ? 'cursor-pointer select-none' : undefined
                      }
                    >
                      <div className="flex flex-row items-center gap-2">
                        {header.isPlaceholder ? null : (
                          <table.FlexRender header={header} />
                        )}
                        {canSort ? (
                          <span>
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )}
                          </span>
                        ) : null}
                      </div>
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
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
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
      <div className="flex gap-1 justify-end  mt-5">
        <Button
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
          variant={'outline'}
        >
          <ChevronsLeft className="h-3 w-3" />
        </Button>
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          variant={'outline'}
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          variant={'outline'}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
        <Button
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
          variant={'outline'}
        >
          <ChevronsRight className="h-3  w-3" />
        </Button>
        <Select
          value={pagination.pageSize.toString()}
          onValueChange={(val) => table.setPageSize(Number(val))}
        >
          <SelectTrigger className="h-1/3">
            <SelectValue placeholder={PAGES_SIZE[0].label} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {PAGES_SIZE.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
