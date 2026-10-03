import { h } from 'vue'
import type { ColumnDef, FilterFn } from '@tanstack/vue-table'
import { cn } from '@/lib/utils'
import { formatDay, formatTime, toStatusClass } from './data'
import type { LogEntry } from './data'
import { utcDayStart } from './date-range'
import type { DateRangeValue } from './date-range'
import Highlight from './Highlight.vue'
import LevelLabel from './LevelLabel.vue'

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
      h('span', { class: 'whitespace-nowrap tabular-nums' }, [
        h('span', { class: 'text-muted-foreground' }, formatDay(row.original.timestamp)),
        ` ${formatTime(row.original.timestamp)}`,
      ]),
  },
  {
    accessorKey: 'level',
    header: 'Level',
    filterFn: inList,
    cell: ({ row }) => h(LevelLabel, { level: row.original.level }),
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
      return h('span', { class: 'flex items-center gap-2 whitespace-nowrap' }, [
        h('span', { class: cn('font-medium tabular-nums', statusTone(log.status)) }, log.status),
        h('span', { class: 'text-xs font-medium text-muted-foreground' }, log.method),
        h('span', [h(Highlight, { text: log.path, query })]),
      ])
    },
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row, table }) =>
      h('span', { class: 'block truncate' }, [
        h(Highlight, {
          text: row.original.message,
          query: table.getState().globalFilter as string,
        }),
      ]),
  },
]
