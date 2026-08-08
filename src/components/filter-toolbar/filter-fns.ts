import type { FilterFn } from '@tanstack/react-table'
import type { DateRange } from 'react-day-picker'

export interface FilterConditionValue {
  operator: string
  value: unknown
}

// One filterFn for every filterable column, regardless of variant — the
// comparison it runs is chosen by `filterValue.operator`, not by which
// column it's attached to. TData isn't used in the body, so `any` here
// doesn't lose real type safety.
export const conditionFilterFn: FilterFn<any> = (
  row,
  columnId,
  filterValue: FilterConditionValue | undefined,
) => {
  if (!filterValue?.operator) return true
  const cellValue = row.getValue(columnId)
  return evaluateOperator(filterValue.operator, cellValue, filterValue.value)
}
conditionFilterFn.autoRemove = (value: FilterConditionValue | undefined) =>
  !value?.operator

function evaluateOperator(
  operator: string,
  cellValue: unknown,
  filterValue: unknown,
): boolean {
  switch (operator) {
    case 'contains':
      return (
        typeof cellValue === 'string' &&
        cellValue.toLowerCase().includes(String(filterValue ?? '').toLowerCase())
      )
    case 'notContains':
      return (
        typeof cellValue === 'string' &&
        !cellValue.toLowerCase().includes(String(filterValue ?? '').toLowerCase())
      )
    case 'is':
      return cellValue === filterValue
    case 'isNot':
      return cellValue !== filterValue
    case 'eq':
      return Number(cellValue) === Number(filterValue)
    case 'neq':
      return Number(cellValue) !== Number(filterValue)
    case 'gt':
      return Number(cellValue) > Number(filterValue)
    case 'gte':
      return Number(cellValue) >= Number(filterValue)
    case 'lt':
      return Number(cellValue) < Number(filterValue)
    case 'lte':
      return Number(cellValue) <= Number(filterValue)
    case 'isAnyOf':
      return Array.isArray(filterValue) && filterValue.includes(cellValue)
    case 'isNoneOf':
      return Array.isArray(filterValue) && !filterValue.includes(cellValue)
    case 'isBetween': {
      const range = filterValue as DateRange | undefined
      const date = cellValue as Date
      if (range?.from && date < range.from) return false
      if (range?.to && date > range.to) return false
      return true
    }
    case 'isEmpty':
      return cellValue === undefined || cellValue === null || cellValue === ''
    case 'isNotEmpty':
      return !(cellValue === undefined || cellValue === null || cellValue === '')
    default:
      return true
  }
}
