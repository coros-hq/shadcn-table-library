import type { Table } from '@tanstack/table-core'

import { formatConditionValue, operatorRegistry } from './operators'
import { useFilterConditions } from './use-filter-conditions.svelte'
import './types'

export interface ActiveFilterEntry {
  columnId: string
  label: string
  /** "{operator label} {value}", e.g. "is any of Design, Engineering". */
  display: string
}

export function useActiveFilters<TData>(table: Table<TData>) {
  const conditions = useFilterConditions(table)

  const entries = $derived.by<ActiveFilterEntry[]>(() => {
    const result: ActiveFilterEntry[] = []

    for (const condition of conditions.current) {
      const meta = table.getColumn(condition.columnId)?.columnDef.meta
      if (!meta?.filterVariant) continue

      const operator = operatorRegistry[meta.filterVariant].find(
        (o) => o.value === condition.operator,
      )
      if (!operator) continue

      const valueDisplay = formatConditionValue(
        meta.filterVariant,
        operator,
        condition.value,
        meta.filterOptions,
      )

      result.push({
        columnId: condition.columnId,
        label: meta.label,
        display: valueDisplay
          ? `${operator.label} ${valueDisplay}`
          : operator.label,
      })
    }

    return result
  })

  return {
    get current() {
      return entries
    },
  }
}
