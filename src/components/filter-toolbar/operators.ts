import { format } from 'date-fns'

import type { DateRange } from 'react-day-picker'

import type { FilterOption, FilterVariant } from './types'

export type ValueShape = 'none' | 'single' | 'array' | 'range'

export interface OperatorDef {
  value: string
  label: string
  valueShape: ValueShape
}

/**
 * What operators are valid for a variant, and what shape of value each one
 * needs. This is the thing that makes the filter builder generic: neither
 * the builder UI nor the filterFn hardcode a per-column list of operators —
 * they both read it from here, keyed by the column's filterVariant.
 */
export const operatorRegistry: Record<FilterVariant, OperatorDef[]> = {
  text: [
    { value: 'contains', label: 'contains', valueShape: 'single' },
    { value: 'notContains', label: 'does not contain', valueShape: 'single' },
    { value: 'is', label: 'is', valueShape: 'single' },
    { value: 'isEmpty', label: 'is empty', valueShape: 'none' },
    { value: 'isNotEmpty', label: 'is not empty', valueShape: 'none' },
  ],
  number: [
    { value: 'eq', label: '=', valueShape: 'single' },
    { value: 'neq', label: '≠', valueShape: 'single' },
    { value: 'gt', label: '>', valueShape: 'single' },
    { value: 'gte', label: '≥', valueShape: 'single' },
    { value: 'lt', label: '<', valueShape: 'single' },
    { value: 'lte', label: '≤', valueShape: 'single' },
    { value: 'isEmpty', label: 'is empty', valueShape: 'none' },
    { value: 'isNotEmpty', label: 'is not empty', valueShape: 'none' },
  ],
  select: [
    { value: 'is', label: 'is', valueShape: 'single' },
    { value: 'isNot', label: 'is not', valueShape: 'single' },
    { value: 'isEmpty', label: 'is empty', valueShape: 'none' },
    { value: 'isNotEmpty', label: 'is not empty', valueShape: 'none' },
  ],
  multiSelect: [
    { value: 'isAnyOf', label: 'is any of', valueShape: 'array' },
    { value: 'isNoneOf', label: 'is none of', valueShape: 'array' },
    { value: 'isEmpty', label: 'is empty', valueShape: 'none' },
    { value: 'isNotEmpty', label: 'is not empty', valueShape: 'none' },
  ],
  dateRange: [
    { value: 'isBetween', label: 'is between', valueShape: 'range' },
    { value: 'isEmpty', label: 'is empty', valueShape: 'none' },
    { value: 'isNotEmpty', label: 'is not empty', valueShape: 'none' },
  ],
}

export interface FilterCondition {
  id: string
  columnId: string
  operator: string
  value: unknown
}

export function isValueValid(operator: OperatorDef, value: unknown): boolean {
  switch (operator.valueShape) {
    case 'none':
      return true
    case 'array':
      return Array.isArray(value) && value.length > 0
    case 'range': {
      const range = value as DateRange | undefined
      return Boolean(range?.from || range?.to)
    }
    case 'single':
      return value !== undefined && value !== null && value !== ''
  }
}

/**
 * Renders the value half of a condition for display — used by both the
 * active-filter pill in the toolbar and the chips row, so the two never
 * describe the same condition differently.
 */
export function formatConditionValue(
  variant: FilterVariant | undefined,
  operator: OperatorDef | undefined,
  value: unknown,
  options: FilterOption[] | undefined,
): string {
  if (!operator || operator.valueShape === 'none') return ''

  switch (variant) {
    case 'multiSelect': {
      const values = (value as string[] | undefined) ?? []
      if (!values.length) return '…'
      return values
        .map((v) => options?.find((o) => o.value === v)?.label ?? v)
        .join(', ')
    }
    case 'select': {
      if (!value) return '…'
      return options?.find((o) => o.value === value)?.label ?? String(value)
    }
    case 'dateRange': {
      const range = value as DateRange | undefined
      if (!range?.from && !range?.to) return '…'
      const from = range.from ? format(range.from, 'MMM d') : '?'
      const to = range.to ? format(range.to, 'MMM d') : '?'
      return `${from} – ${to}`
    }
    case 'text':
    case 'number':
      return value === undefined || value === null || value === ''
        ? '…'
        : String(value)
    default:
      return ''
  }
}
