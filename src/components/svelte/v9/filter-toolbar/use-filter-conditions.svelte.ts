import type { RowData, Table } from '@tanstack/svelte-table'
import type { FilterToolbarFeatures } from './types'

import type { FilterConditionValue } from './filter-fns'
import type { FilterCondition } from './operators'

/**
 * Reads FilterCondition[] straight from `table.atoms.columnFilters.get()` —
 * columnFilters (keyed by columnId, valued `{ operator, value }`) is the one
 * source of truth. There's nowhere else a condition could live, so the
 * toolbar pills, the "+ Add filter" menu, and the chips row can never drift
 * out of sync with each other.
 */
export function useFilterConditions<TData extends RowData>(
  table: Table<FilterToolbarFeatures, TData>,
) {
  const conditions = $derived.by<FilterCondition[]>(() => {
    const result: FilterCondition[] = []

    for (const filter of table.atoms.columnFilters.get()) {
      const meta = table.getColumn(filter.id)?.columnDef.meta
      if (!meta?.filterVariant) continue

      const raw = filter.value as FilterConditionValue | undefined
      if (!raw?.operator) continue

      result.push({
        id: filter.id,
        columnId: filter.id,
        operator: raw.operator,
        value: raw.value,
      })
    }

    return result
  })

  return {
    get current() {
      return conditions
    },
  }
}
