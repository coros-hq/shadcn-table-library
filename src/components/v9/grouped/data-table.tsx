'use client'

import {
  flexRender,
  useTable,
} from '@tanstack/react-table-v9'

import type {
  ColumnDef,
  ExpandedState,
  GroupingState, RowData} from '@tanstack/react-table-v9'

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
import { v9Features, type V9Features } from '#/lib/table-v9-features.ts'

interface GroupedDataTableProps<TData extends RowData> {
  columns: ColumnDef<V9Features, TData, any>[]
  data: TData[]
  groupBy: string
}

export function GroupedDataTable<TData extends RowData>({
  columns,
  data,
  groupBy,
}: GroupedDataTableProps<TData>) {
  const [grouping, setGrouping] = useState<GroupingState>([groupBy])
  const [expanded, setExpanded] = useState<ExpandedState>(true)

  const table = useTable({
    features: v9Features,
    data,
    columns,
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
