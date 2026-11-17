'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { ColumnsMenu, PinControls, pinClass, pinStyles } from './column-controls'
import { ExportMenu } from './export-menu'

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const
type Align = keyof typeof alignClass

// Alignment is set per column in `meta: { align }`
const alignOf = (def: { meta?: unknown }): Align =>
  (def.meta as { align?: Align } | undefined)?.align ?? 'left'

const skeletonClass = {
  left: '',
  center: 'mx-auto',
  right: 'ml-auto',
} as const

interface DataTableProps<TData extends { id: string }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Shows the loading state instead of rows */
  isLoading?: boolean
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  // The table keeps its own copy of the rows so changes show up right
  // away. Send them to your backend here too.
  const [tableData, setTableData] = useState(data)
  const meta = {
    updateCell: (rowId: string, columnId: string, value: unknown) =>
      setTableData((prev) =>
        prev.map((row) =>
          row.id === rowId ? { ...row, [columnId]: value } : row,
        ),
      ),
  }

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Rows keep their identity through edits, sorting and deletes
    getRowId: (row) => row.id,
    meta,
    initialState: { columnPinning: { left: ['name'], right: ['due'] } },
  })

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="ml-auto flex items-center gap-2">
          <ColumnsMenu table={table} />
          <ExportMenu
            table={table}
            formats={['csv', 'excel']}
            filename={'table-export'}
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border" aria-busy={isLoading}>
        <Table
          // Fixed widths keep the pinned offsets exact once the table scrolls
          className="table-fixed"
          style={{ minWidth: table.getTotalSize() }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`group/head ${alignClass[alignOf(header.column.columnDef)]} ${pinClass(header.column)}`}
                    style={pinStyles(header.column)}
                  >
                    <div className="flex items-center gap-1">
                      <div className="min-w-0 flex-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                      <PinControls column={header.column} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {table.getVisibleLeafColumns().map((column, index) => (
                    <TableCell key={column.id}>
                  {rowIndex === 0 && index === 0 ? (
                    <span role="status" className="sr-only">
                      {'Loading...'}
                    </span>
                  ) : null}
                      <Skeleton className={`h-4 w-3/4 ${skeletonClass[alignOf(column.columnDef)]}`} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id} className={`${alignClass[alignOf(cell.column.columnDef)]} ${pinClass(cell.column)}`}
                      style={pinStyles(cell.column)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                  <p className="text-sm font-medium">{'No results'}</p>
                  <p className="text-sm text-muted-foreground">
                    {'Try changing your search or filters.'}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
