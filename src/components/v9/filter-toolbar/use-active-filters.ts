import { useMemo } from 'react'

import type { Table, RowData} from '@tanstack/react-table-v9'

import { formatConditionValue, operatorRegistry } from './operators'
import { useFilterConditions } from './use-filter-conditions'
import type { FilterToolbarFeatures } from './types'
import './types'

export interface ActiveFilterEntry {
  columnId: string
  label: string
  /** "{operator label} {value}", e.g. "is any of Design, Engineering". */
  display: string
}

export function useActiveFilters<TData extends RowData>(
  table: Table<FilterToolbarFeatures, TData>,
): ActiveFilterEntry[] {
  const conditions = useFilterConditions(table)

  return useMemo(() => {
    const entries: ActiveFilterEntry[] = []

    for (const condition of conditions) {
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

      entries.push({
        columnId: condition.columnId,
        label: meta.label,
        display: valueDisplay
          ? `${operator.label} ${valueDisplay}`
          : operator.label,
      })
    }

    return entries
  }, [conditions, table])
}
