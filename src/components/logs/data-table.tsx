'use client'

import { Fragment, useMemo } from 'react'
import { flexRender, getExpandedRowModel } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils.ts'
import type { LogEntry } from './data'
import { LogFields } from './log-fields'
import { LoadOlderEvents, LogsToolbar, NoResults } from './toolbar'
import { useLogsTable } from './use-logs-table'

const expandColumn: ColumnDef<LogEntry> = {
  id: 'expand',
  header: () => <span className="sr-only">Details</span>,
  cell: ({ row }) => (
    <button
      type="button"
      aria-label={row.getIsExpanded() ? 'Hide details' : 'Show details'}
      aria-expanded={row.getIsExpanded()}
      onClick={(e) => {
        // The row itself also toggles on click; don't toggle twice
        e.stopPropagation()
        row.toggleExpanded()
      }}
      className="flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <ChevronRight
        className={cn(
          'size-3.5 transition-transform',
          row.getIsExpanded() && 'rotate-90',
        )}
      />
    </button>
  ),
}

interface LogsTableProps {
  columns: ColumnDef<LogEntry, any>[]
  data: LogEntry[]
}

export function LogsTable({ columns, data }: LogsTableProps) {
  const allColumns = useMemo(() => [expandColumn, ...columns], [columns])
  const table = useLogsTable({
    data,
    columns: allColumns,
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
  })

  const rows = table.getRowModel().rows

  return (
    <div className="space-y-3">
      <LogsToolbar table={table} />

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'h-9 text-xs',
                      header.column.id === 'expand' && 'w-8 pr-0',
                      header.column.id === 'message' && 'w-full',
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    onClick={() => row.toggleExpanded()}
                    data-state={row.getIsExpanded() ? 'selected' : undefined}
                    className={cn(
                      'cursor-pointer',
                      row.original.level === 'error' &&
                        'bg-red-500/[0.04] dark:bg-red-500/[0.07]',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'py-2',
                          cell.column.id === 'expand' && 'pr-0',
                          // max-w-0 lets the message take the leftover width and truncate
                          cell.column.id === 'message' && 'max-w-0 min-w-40',
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className="bg-muted/30 p-0"
                      >
                        <LogFields
                          log={row.original}
                          className="px-4 py-3 pl-12"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-32 text-center"
                >
                  <NoResults table={table} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <LoadOlderEvents table={table} />
    </div>
  )
}
