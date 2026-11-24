import {
  createTable,
  type FilterFn,
  type TableOptions,
} from '@tanstack/svelte-table'
import { v9Features, type V9Features } from '$lib/table-v9-features'
import type { LogEntry } from './data'

export const PAGE_SIZE = 20

// Search matches what people paste from an alert: message, path, or a request id
const searchLogs: FilterFn<V9Features, LogEntry> = (
  row,
  _id,
  query: string,
) => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const log = row.original
  return [log.message, log.path, log.requestId].some((field) =>
    field.toLowerCase().includes(q),
  )
}

type LogsTableOptions = Pick<
  TableOptions<V9Features, LogEntry>,
  'data' | 'columns'
> &
  Partial<Omit<TableOptions<V9Features, LogEntry>, 'data' | 'columns'>>

// Options are merged by property descriptor, not spread, so getters such as
// `get data()` stay live instead of being read once.
function mergeOptions(base: object, options: object): object {
  const target: Record<PropertyKey, unknown> = {}
  for (const source of [base, options]) {
    for (const key of Reflect.ownKeys(source)) {
      const descriptor = Object.getOwnPropertyDescriptor(source, key)
      if (descriptor) Object.defineProperty(target, key, descriptor)
    }
  }
  return target
}

/**
 * Filtering, faceting, search, and paging shared by both logs layouts. Each
 * layout adds its own options on top: row expansion, or a selected row.
 */
export function useLogsTable(options: LogsTableOptions) {
  const base = {
    features: v9Features,
    getRowId: (row: LogEntry) => row.id,
    globalFilterFn: searchLogs,
    initialState: {
      globalFilter: '',
      pagination: { pageIndex: 0, pageSize: PAGE_SIZE },
    },
  }

  return createTable(
    mergeOptions(base, options) as TableOptions<V9Features, LogEntry>,
  )
}
