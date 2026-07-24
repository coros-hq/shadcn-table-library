'use client'

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { useRouterState } from '@tanstack/react-router'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils.ts'
import { Route } from '#/routes/server-table'
import type { User } from './columns'

interface DataTableProps {
  columns: ColumnDef<User>[]
}

const PAGES_SIZE = [
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '30', value: '30' },
  { label: '40', value: '40' },
  { label: '50', value: '50' },
]

export function DataTable({ columns }: DataTableProps) {
  const { page, pageSize } = Route.useSearch()
  const { rows, pageCount } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const isPending = useRouterState({ select: (s) => s.isLoading })

  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: rows,
    columns,
    pageCount,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination: { pageIndex: page, pageSize },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex: page, pageSize })
          : updater
      navigate({
        search: (prev) => ({
          ...prev,
          page: next.pageIndex,
          pageSize: next.pageSize,
        }),
      })
    },
    onSortingChange: setSorting,
  })

  return (
    <div>
      <div
        className={cn(
          'overflow-hidden rounded-md border transition-opacity',
          isPending && 'opacity-50',
        )}
      >
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
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
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
      <div className="flex gap-1 justify-end mt-5">
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
          <ChevronsRight className="h-3 w-3" />
        </Button>
        <Select
          value={pageSize.toString()}
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
