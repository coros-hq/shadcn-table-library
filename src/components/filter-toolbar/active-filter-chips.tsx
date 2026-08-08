'use client'

import { X } from 'lucide-react'

import type { Table } from '@tanstack/react-table'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { useActiveFilters } from './use-active-filters'

export interface ActiveFilterChipsProps<TData> {
  table: Table<TData>
}

export function ActiveFilterChips<TData>({
  table,
}: ActiveFilterChipsProps<TData>) {
  const activeFilters = useActiveFilters(table)

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((filter) => (
        <Badge key={filter.columnId} variant="secondary" className="gap-1 pr-1">
          {filter.label} {filter.display}
          <button
            type="button"
            onClick={() =>
              table.getColumn(filter.columnId)?.setFilterValue(undefined)
            }
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
        Clear all
      </Button>
    </div>
  )
}
