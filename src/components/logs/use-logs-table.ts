'use client'

import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { FilterFn, TableOptions } from '@tanstack/react-table'
import type { LogEntry } from './data'

export const PAGE_SIZE = 20

// Search matches what people paste from an alert: message, path, or a request id
const searchLogs: FilterFn<LogEntry> = (row, _id, query: string) => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const log = row.original
  return [log.message, log.path, log.requestId].some((field) =>
    field.toLowerCase().includes(q),
  )
}

type LogsTableOptions = Pick<TableOptions<LogEntry>, 'data' | 'columns'> &
  Partial<Omit<TableOptions<LogEntry>, 'data' | 'columns'>>

/**
 * Filtering, faceting, search, and paging shared by both logs layouts. Each
 * layout adds its own options on top: row expansion, or a selected row.
 */
export function useLogsTable(options: LogsTableOptions) {
  return useReactTable({
    getRowId: (row) => row.id,
    globalFilterFn: searchLogs,
    initialState: {
      globalFilter: '',
      pagination: { pageIndex: 0, pageSize: PAGE_SIZE },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    ...options,
  })
}
