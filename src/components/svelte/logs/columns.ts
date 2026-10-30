import type { ColumnDef, FilterFn } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import { toStatusClass } from './data'
import type { LogEntry } from './data'
import { utcDayStart } from './date-range'
import type { DateRangeValue } from './date-range'
import LevelLabel from './LevelLabel.svelte'
import MessageCell from './MessageCell.svelte'
import RequestCell from './RequestCell.svelte'
import TimeCell from './TimeCell.svelte'

export function statusTone(status: number) {
  if (status >= 500) return 'text-red-600 dark:text-red-400'
  if (status >= 400) return 'text-amber-600 dark:text-amber-400'
  return 'text-muted-foreground'
}

// Multi-select filters store string[]; an empty/undefined value means "all"
const inList: FilterFn<LogEntry> = (row, id, value: string[] | undefined) =>
  !value?.length || value.includes(row.getValue<string>(id))

// Both ends of the range are whole days, inclusive
const inDateRange: FilterFn<LogEntry> = (
  row,
  id,
  range: DateRangeValue | undefined,
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
    cell: ({ row }) =>
      renderComponent(TimeCell, { timestamp: row.original.timestamp }),
  },
  {
    accessorKey: 'level',
    header: 'Level',
    filterFn: inList,
    cell: ({ row }) =>
      renderComponent(LevelLabel, { level: row.original.level }),
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
    cell: ({ row, table }) =>
      renderComponent(RequestCell, {
        log: row.original,
        query: table.getState().globalFilter as string,
      }),
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row, table }) =>
      renderComponent(MessageCell, {
        message: row.original.message,
        query: table.getState().globalFilter as string,
      }),
  },
]
