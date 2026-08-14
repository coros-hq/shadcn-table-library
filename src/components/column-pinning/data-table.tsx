'use client'

import type { CSSProperties } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { Column, ColumnDef, ColumnPinningState } from '@tanstack/react-table'
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  initialPinning?: ColumnPinningState
}

function getPinningStyles<TData>(column: Column<TData, unknown>): CSSProperties {
  const isPinned = column.getIsPinned()
  const size = column.getSize()
  return {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: size,
    minWidth: size,
    maxWidth: size,
    zIndex: isPinned ? 1 : 0,
  }
}

function PinControls<TData>({ column }: { column: Column<TData, unknown> }) {
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
        onClick={() => column.pin('left')}
      >
        <ArrowLeftToLine className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6"
        aria-label={`Pin ${String(column.columnDef.header)} column right`}
        onClick={() => column.pin('right')}
      >
        <ArrowRightToLine className="size-3.5" />
      </Button>
    </div>
  )
}

export function DataTable<TData, TValue>({
  columns,
  data,
  initialPinning,
}: DataTableProps<TData, TValue>) {
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
    initialPinning ?? {},
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
                  isPinned === 'left' && header.column.getIsLastColumn('left')
                const isFirstRightPinned =
                  isPinned === 'right' &&
                  header.column.getIsFirstColumn('right')

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
                    isPinned === 'left' && cell.column.getIsLastColumn('left')
                  const isFirstRightPinned =
                    isPinned === 'right' &&
                    cell.column.getIsFirstColumn('right')

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
