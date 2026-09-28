'use client'

import {
  useTable,
} from '@tanstack/react-table-v9'
import type { FilterFn, TableOptions } from '@tanstack/react-table-v9'
import type { LogEntry } from './data'
import { v9Features, type V9Features } from '#/lib/table-v9-features.ts'

export const PAGE_SIZE = 20

// Search matches what people paste from an alert: message, path, or a request id
const searchLogs: FilterFn<V9Features, LogEntry> = (row, _id, query: string) => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const log = row.original
  return [log.message, log.path, log.requestId].some((field) =>
    field.toLowerCase().includes(q),
  )
}

type LogsTableOptions = Pick<TableOptions<V9Features, LogEntry>, 'data' | 'columns'> &
  Partial<Omit<TableOptions<V9Features, LogEntry>, 'data' | 'columns'>>

/**
 * Filtering, faceting, search, and paging shared by both logs layouts. Each
 * layout adds its own options on top: row expansion, or a selected row.
 */
export function useLogsTable(options: LogsTableOptions) {
  return useTable({
    features: v9Features,
    getRowId: (row) => row.id,
    globalFilterFn: searchLogs,
    initialState: {
      globalFilter: '',
      pagination: { pageIndex: 0, pageSize: PAGE_SIZE },
    },
    ...options,
  })
}
