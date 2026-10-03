import type { Table } from '@tanstack/vue-table'
import type { LogEntry } from './data'

export function isFiltered(table: Table<LogEntry>) {
  const { columnFilters, globalFilter } = table.getState()
  return columnFilters.length > 0 || globalFilter !== ''
}

export function clearFilters(table: Table<LogEntry>) {
  table.resetColumnFilters(true)
  table.setGlobalFilter('')
}
