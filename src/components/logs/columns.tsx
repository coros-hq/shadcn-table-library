'use client'

import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { DateRange } from 'react-day-picker'
import { cn } from '#/lib/utils.ts'
import { formatDay, formatTime, toStatusClass } from './data'
import type { LogEntry, LogLevel } from './data'
import { utcDayStart } from './date-range-filter'

const levelStyles: Record<LogLevel, { dot: string; text: string }> = {
  error: { dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  warn: { dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  info: { dot: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400' },
  debug: { dot: 'bg-muted-foreground/40', text: 'text-muted-foreground' },
}

/** Level marker, shared by the table and the Level filter menu */
export function LevelDot({ level }: { level: LogLevel }) {
  return (
    <span
      aria-hidden
      className={cn('size-1.5 shrink-0 rounded-full', levelStyles[level].dot)}
    />
  )
}

export function LevelLabel({ level }: { level: LogLevel }) {
  return (
    <span
      className={cn(
        'flex items-center gap-2 font-medium capitalize',
        levelStyles[level].text,
      )}
    >
      <LevelDot level={level} />
      {level}
    </span>
  )
}

export function statusTone(status: number) {
  if (status >= 500) return 'text-red-600 dark:text-red-400'
  if (status >= 400) return 'text-amber-600 dark:text-amber-400'
  return 'text-muted-foreground'
}

/** Wraps every case-insensitive match of `query` in a <mark> */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  if (!q) return text
  const parts = text.split(
    new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
  )
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark
        key={i}
        className="rounded-[2px] bg-yellow-300/60 text-foreground dark:bg-yellow-500/40"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

// Multi-select filters store string[]; an empty/undefined value means "all"
const inList: FilterFn<LogEntry> = (row, id, value: string[] | undefined) =>
  !value?.length || value.includes(row.getValue<string>(id))

// Both ends of the range are whole days, inclusive
const inDateRange: FilterFn<LogEntry> = (
  row,
  id,
  range: DateRange | undefined,
) => {
  if (!range?.from) return true
  const timestamp = row.getValue<number>(id)
  const start = utcDayStart(range.from)
  const end = utcDayStart(range.to ?? range.from) + 86_400_000
  return timestamp >= start && timestamp < end
}

export const columns: ColumnDef<LogEntry>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Time (UTC)',
    filterFn: inDateRange,
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums">
        <span className="text-muted-foreground">
          {formatDay(row.original.timestamp)}
        </span>{' '}
        {formatTime(row.original.timestamp)}
      </span>
    ),
  },
  {
    accessorKey: 'level',
    header: 'Level',
    filterFn: inList,
    cell: ({ row }) => <LevelLabel level={row.original.level} />,
  },
  {
    accessorKey: 'service',
    header: 'Service',
    filterFn: inList,
  },
  {
    id: 'statusClass',
    accessorFn: (row) => toStatusClass(row.status),
    header: 'Request',
    filterFn: inList,
    cell: ({ row, table }) => {
      const log = row.original
      const query = table.getState().globalFilter as string
      return (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <span
            className={cn('font-medium tabular-nums', statusTone(log.status))}
          >
            {log.status}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {log.method}
          </span>
          <span>
            <Highlight text={log.path} query={query} />
          </span>
        </span>
      )
    },
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row, table }) => (
      <span className="block truncate">
        <Highlight
          text={row.original.message}
          query={table.getState().globalFilter as string}
        />
      </span>
    ),
  },
]
