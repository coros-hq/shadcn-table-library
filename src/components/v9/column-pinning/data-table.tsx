'use client'

import type { CSSProperties } from 'react'
import {
  flexRender,
  useTable,
} from '@tanstack/react-table-v9'
import type { Column, ColumnDef, ColumnPinningState, RowData} from '@tanstack/react-table-v9'
import { useState } from 'react'
import { ArrowLeftToLine, ArrowRightToLine, PinOff } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils.ts'
import { v9Features, type V9Features } from '#/lib/table-v9-features.ts'

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<V9Features, TData, any>[]
  data: TData[]
  initialPinning?: ColumnPinningState
}

function getPinningStyles<TData extends RowData>(column: Column<V9Features, TData, unknown>): CSSProperties {
  const isPinned = column.getIsPinned()
  const size = column.getSize()
  return {
    left: isPinned === 'start' ? `${column.getStart('start')}px` : undefined,
    right: isPinned === 'end' ? `${column.getAfter('end')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: size,
    minWidth: size,
    maxWidth: size,
    zIndex: isPinned ? 1 : 0,
  }
}

function PinControls<TData extends RowData>({ column }: { column: Column<V9Features, TData, unknown> }) {
  const isPinned = column.getIsPinned()

  if (isPinned) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6 shrink-0 opacity-0 group-hover/head:opacity-100 data-[pinned=true]:opacity-100"
        data-pinned="true"
        aria-label={`Unpin ${String(column.columnDef.header)} column`}
        onClick={() => column.pin(false)}
      >
        <PinOff className="size-3.5" />
      </Button>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover/head:opacity-100">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6"
        aria-label={`Pin ${String(column.columnDef.header)} column left`}
        onClick={() => column.pin('start')}
      >
        <ArrowLeftToLine className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6"
        aria-label={`Pin ${String(column.columnDef.header)} column right`}
        onClick={() => column.pin('end')}
      >
        <ArrowRightToLine className="size-3.5" />
      </Button>
    </div>
  )
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  initialPinning,
}: DataTableProps<TData>) {
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
    initialPinning ?? { start: [], end: [] },
  )

  const table = useTable({
    features: v9Features,
    data,
    columns,
    state: { columnPinning },
    onColumnPinningChange: setColumnPinning,
    defaultColumn: { size: 160 },
  })

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table
        className="table-fixed"
        style={{ width: table.getTotalSize() }}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isPinned = header.column.getIsPinned()
                const isLastLeftPinned =
                  isPinned === 'start' &&
                  header.column.getIsLastColumn('start')
                const isFirstRightPinned =
                  isPinned === 'end' && header.column.getIsFirstColumn('end')

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'group/head bg-background',
                      isLastLeftPinned && 'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]',
                      isFirstRightPinned && 'shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]',
                    )}
                    style={getPinningStyles(header.column)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </span>
                      <PinControls column={header.column} />
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
                {row.getVisibleCells().map((cell) => {
                  const isPinned = cell.column.getIsPinned()
                  const isLastLeftPinned =
                    isPinned === 'start' &&
                    cell.column.getIsLastColumn('start')
                  const isFirstRightPinned =
                    isPinned === 'end' &&
                    cell.column.getIsFirstColumn('end')

                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'truncate bg-background',
                        isLastLeftPinned && 'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]',
                        isFirstRightPinned && 'shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]',
                      )}
                      style={getPinningStyles(cell.column)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
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
