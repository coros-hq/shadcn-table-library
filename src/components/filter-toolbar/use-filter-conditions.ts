import { useMemo } from 'react'

import type { Table } from '@tanstack/react-table'

import type { FilterConditionValue } from './filter-fns'
import type { FilterCondition } from './operators'
import './types'

/**
 * Reads FilterCondition[] straight from `table.getState().columnFilters` —
 * columnFilters (keyed by columnId, valued `{ operator, value }`) is the one
 * source of truth. There's nowhere else a condition could live, so the
 * toolbar pills, the "+ Add filter" menu, and the chips row can never drift
 * out of sync with each other.
 */
export function useFilterConditions<TData>(
  table: Table<TData>,
): FilterCondition[] {
  const columnFilters = table.getState().columnFilters

  return useMemo(() => {
    const conditions: FilterCondition[] = []

    for (const filter of columnFilters) {
      const meta = table.getColumn(filter.id)?.columnDef.meta
      if (!meta?.filterVariant) continue

      const raw = filter.value as FilterConditionValue | undefined
      if (!raw?.operator) continue

      conditions.push({
        id: filter.id,
        columnId: filter.id,
        operator: raw.operator,
        value: raw.value,
      })
    }

    return conditions
  }, [columnFilters, table])
}
