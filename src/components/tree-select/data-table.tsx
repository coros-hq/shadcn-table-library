'use client'

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import type {
  ColumnDef,
  ExpandedState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table'

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

interface TreeSelectDataTableProps<TData extends { children?: TData[] }> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
}

export function TreeSelectDataTable<TData extends { children?: TData[] }>({
  columns,
  data,
}: TreeSelectDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [expanded, setExpanded] = useState<ExpandedState>(true)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSubRows: (row) => row.children,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      expanded,
      rowSelection,
    },
  })

  const selectedCount = table.getSelectedRowModel().flatRows.length
  const totalCount = table.getRowModel().flatRows.length

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        {selectedCount} of {totalCount} rows selected
      </p>
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
                      onClick={canSort ? sortHandler : undefined}
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
    </div>
  )
}
