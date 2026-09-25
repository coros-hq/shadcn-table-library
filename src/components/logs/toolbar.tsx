'use client'

import type { Table } from '@tanstack/react-table'
import { Search, X } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { LevelDot } from './columns'
import { levels, services, statusClasses } from './data'
import type { LogEntry, LogLevel } from './data'
import { DateRangeFilter } from './date-range-filter'
import { FacetedFilter } from './faceted-filter'
import { PAGE_SIZE } from './use-logs-table'

export function isFiltered(table: Table<LogEntry>) {
  const { columnFilters, globalFilter } = table.getState()
  return columnFilters.length > 0 || globalFilter !== ''
}

export function clearFilters(table: Table<LogEntry>) {
  table.resetColumnFilters(true)
  table.setGlobalFilter('')
}

export function LogsToolbar({ table }: { table: Table<LogEntry> }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-auto sm:max-w-64 sm:min-w-40 sm:flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={table.getState().globalFilter as string}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          placeholder="Message, path, request id…"
          aria-label="Search logs"
          className="h-8 pl-8"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:justify-end">
        {isFiltered(table) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => clearFilters(table)}
          >
            Reset
            <X className="size-3.5" />
          </Button>
        )}
        <DateRangeFilter column={table.getColumn('timestamp')} />
        <FacetedFilter
          column={table.getColumn('level')}
          title="Level"
          options={levels}
          renderIcon={(level) => <LevelDot level={level as LogLevel} />}
          formatLabel={(level) => level[0].toUpperCase() + level.slice(1)}
        />
        <FacetedFilter
          column={table.getColumn('service')}
          title="Service"
          options={services}
        />
        <FacetedFilter
          column={table.getColumn('statusClass')}
          title="Status"
          options={statusClasses}
        />
      </div>
    </div>
  )
}

/** Grows the page instead of paging, so newest events stay on top */
export function LoadOlderEvents({ table }: { table: Table<LogEntry> }) {
  const filteredCount = table.getFilteredRowModel().rows.length
  const shownCount = table.getRowModel().rows.length
  if (shownCount >= filteredCount) return null
  return (
    <div className="flex items-center justify-center gap-3">
      <p className="text-sm text-muted-foreground tabular-nums">
        Showing {shownCount} of {filteredCount}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8"
        onClick={() => table.setPageSize((size) => size + PAGE_SIZE)}
      >
        Load older events
      </Button>
    </div>
  )
}

export function NoResults({ table }: { table: Table<LogEntry> }) {
  return (
    <>
      <p className="text-muted-foreground">
        No log events match these filters.
      </p>
      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={() => clearFilters(table)}
      >
        Reset filters
      </Button>
    </>
  )
}
