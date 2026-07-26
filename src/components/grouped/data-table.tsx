'use client'

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import type {
  ColumnDef,
  ExpandedState,
  GroupingState,
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
import { cn } from '#/lib/utils.ts'

interface GroupedDataTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  groupBy: string
}

export function GroupedDataTable<TData>({
  columns,
  data,
  groupBy,
}: GroupedDataTableProps<TData>) {
  const [grouping, setGrouping] = useState<GroupingState>([groupBy])
  const [expanded, setExpanded] = useState<ExpandedState>(true)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    state: {
      grouping,
      expanded,
    },
  })

  return (
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
              <TableRow
                key={row.id}
                className={cn(row.getIsGrouped() && 'bg-muted/50')}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
