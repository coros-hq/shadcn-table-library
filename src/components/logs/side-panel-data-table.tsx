'use client'

import { useEffect, useState } from 'react'
import { flexRender } from '@tanstack/react-table'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

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
import { LevelLabel, statusTone } from './columns'
import { formatDay, formatTime } from './data'
import type { LogEntry } from './data'
import { LogFields } from './log-fields'
import { LoadOlderEvents, LogsToolbar, NoResults } from './toolbar'
import { useLogsTable } from './use-logs-table'

// The panel takes the room these columns would use; its header repeats them
const hiddenWhileOpen = { service: false, statusClass: false }

interface LogsSidePanelTableProps {
  columns: ColumnDef<LogEntry, any>[]
  data: LogEntry[]
}

export function LogsSidePanelTable({ columns, data }: LogsSidePanelTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const table = useLogsTable({
    data,
    columns,
    state: { columnVisibility: selectedId ? hiddenWhileOpen : {} },
  })

  const rows = table.getRowModel().rows
  const selectedIndex = rows.findIndex((row) => row.id === selectedId)
  const selected = selectedIndex === -1 ? undefined : rows[selectedIndex]

  // A filter can remove the selected event; close the panel instead of
  // showing details for a row that is no longer in the table
  useEffect(() => {
    if (selectedId && !selected) setSelectedId(null)
  }, [selectedId, selected])

  function selectAt(index: number) {
    const row = rows.at(index)
    if (index < 0 || !row) return
    setSelectedId(row.id)
    document.getElementById(`log-row-${row.id}`)?.focus()
  }

  function onRowKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      selectAt(index + (e.key === 'ArrowDown' ? 1 : -1))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedId(rows[index].id === selectedId ? null : rows[index].id)
    } else if (e.key === 'Escape') {
      setSelectedId(null)
    }
  }

  return (
    <div className="space-y-3">
      <LogsToolbar table={table} />

      {/* overflow-clip (not hidden) keeps the rounded corners without
          breaking the panel's sticky positioning */}
      <div className="relative flex overflow-clip rounded-md border">
        <div className="min-w-0 flex-1">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'h-9 text-xs',
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
                rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    id={`log-row-${row.id}`}
                    tabIndex={0}
                    aria-selected={row.id === selectedId}
                    data-state={row.id === selectedId ? 'selected' : undefined}
                    onClick={() =>
                      setSelectedId(row.id === selectedId ? null : row.id)
                    }
                    onKeyDown={(e) => onRowKeyDown(e, index)}
                    className={cn(
                      'cursor-pointer outline-none focus-visible:bg-muted/60',
                      row.original.level === 'error' &&
                        'bg-red-500/[0.04] dark:bg-red-500/[0.07]',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'py-2',
                          // max-w-0 lets the message take the leftover width and truncate
                          cell.column.id === 'message' && 'max-w-0 min-w-32',
                        )}
                      >
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

        {selected && (
          <LogPanel
            row={selected}
            onPrevious={
              selectedIndex > 0 ? () => selectAt(selectedIndex - 1) : undefined
            }
            onNext={
              selectedIndex < rows.length - 1
                ? () => selectAt(selectedIndex + 1)
                : undefined
            }
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      <LoadOlderEvents table={table} />
    </div>
  )
}

interface LogPanelProps {
  row: Row<LogEntry>
  onPrevious?: () => void
  onNext?: () => void
  onClose: () => void
}

function LogPanel({ row, onPrevious, onNext, onClose }: LogPanelProps) {
  const log = row.original
  return (
    <aside
      aria-label="Log details"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      // Covers the table on phones, sits beside it from sm up
      className="absolute inset-0 z-10 bg-background sm:static sm:w-80 sm:shrink-0 sm:border-l"
    >
      <div className="sticky top-0">
        <div className="flex items-center gap-2 border-b py-1.5 pr-1.5 pl-4">
          <LevelLabel level={log.level} />
          <span className="text-sm text-muted-foreground tabular-nums">
            {formatDay(log.timestamp)} {formatTime(log.timestamp)}
          </span>
          <div className="ml-auto flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Previous event"
              disabled={!onPrevious}
              onClick={onPrevious}
            >
              <ChevronUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Next event"
              disabled={!onNext}
              onClick={onNext}
            >
              <ChevronDown className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Close details"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="space-y-1.5">
            <p className="text-base leading-snug font-medium">{log.message}</p>
            <p className="flex flex-wrap items-center gap-x-2 text-sm">
              <span
                className={cn(
                  'font-medium tabular-nums',
                  statusTone(log.status),
                )}
              >
                {log.status}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {log.method}
              </span>
              <span className="break-all">{log.path}</span>
              <span className="text-muted-foreground">· {log.service}</span>
            </p>
          </div>
          <LogFields
            log={log}
            omit={['Level', 'Message', 'Method', 'Path', 'Status', 'Service']}
            className="border-t pt-4"
          />
        </div>
      </div>
    </aside>
  )
}
