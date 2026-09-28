import { useMemo } from 'react'

import type { Table, RowData} from '@tanstack/react-table-v9'

import type { FilterConditionValue } from './filter-fns'
import type { FilterCondition } from './operators'
import type { FilterToolbarFeatures } from './types'
import './types'

/**
 * Reads FilterCondition[] straight from `table.store.state.columnFilters` —
 * columnFilters (keyed by columnId, valued `{ operator, value }`) is the one
 * source of truth. There's nowhere else a condition could live, so the
 * toolbar pills, the "+ Add filter" menu, and the chips row can never drift
 * out of sync with each other.
 */
export function useFilterConditions<TData extends RowData>(
  table: Table<FilterToolbarFeatures, TData>,
): FilterCondition[] {
  const columnFilters = table.store.state.columnFilters

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
