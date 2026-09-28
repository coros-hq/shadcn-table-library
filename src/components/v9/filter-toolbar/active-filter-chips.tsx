'use client'

import { X } from 'lucide-react'

import type { Table, RowData} from '@tanstack/react-table-v9'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { useActiveFilters } from './use-active-filters'
import type { FilterToolbarFeatures } from './types'

export interface ActiveFilterChipsProps<TData extends RowData> {
  table: Table<FilterToolbarFeatures, TData>
}

export function ActiveFilterChips<TData extends RowData>({
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
