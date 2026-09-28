'use client'

import {
  flexRender,
  useTable,
} from '@tanstack/react-table-v9'

import type {
  ColumnDef,
  ExpandedState,
  SortingState, RowData} from '@tanstack/react-table-v9'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Input } from '#/components/ui/input'
import { v9Features, type V9Features } from '#/lib/table-v9-features.ts'

interface TreeDataTableProps<TData extends RowData & { children?: TData[] }> {
  columns: ColumnDef<V9Features, TData, any>[]
  data: TData[]
}

export function TreeDataTable<TData extends RowData & { children?: TData[] }>({
  columns,
  data,
}: TreeDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [expanded, setExpanded] = useState<ExpandedState>(true)

  const table = useTable({
    features: v9Features,
    data,
    columns,
    getSubRows: (row) => row.children,
    filterFromLeafRows: true,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
      expanded,
    },
  })

  return (
    <div>
      <Input
        type="text"
        placeholder="Search..."
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        className="mb-3 w-64"
      />
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
