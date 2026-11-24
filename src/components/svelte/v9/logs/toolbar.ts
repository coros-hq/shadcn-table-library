import type { Table } from '@tanstack/svelte-table'
import type { V9Features } from '$lib/table-v9-features'
import type { LogEntry } from './data'

export function isFiltered(table: Table<V9Features, LogEntry>) {
  const columnFilters = table.atoms.columnFilters.get()
  const globalFilter = table.atoms.globalFilter.get()
  return columnFilters.length > 0 || globalFilter !== ''
}

export function clearFilters(table: Table<V9Features, LogEntry>) {
  table.resetColumnFilters(true)
  table.setGlobalFilter('')
}
