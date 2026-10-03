import '@tanstack/vue-table'
import type { RowData } from '@tanstack/vue-table'

export type FilterVariant =
  | 'text'
  | 'number'
  | 'dateRange'
  | 'select'
  | 'multiSelect'

export interface FilterOption {
  label: string
  value: string
}

export interface DateRangeValue {
  from?: Date
  to?: Date
}

// Module augmentation: adds `label`/`filterVariant`/`filterOptions` to every
// column's `meta` so FilterToolbar and useActiveFilters can read them without
// per-column wiring. TData/TValue must be re-declared to match TanStack's
// own signature or the merge is silently ignored.
declare module '@tanstack/vue-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    label: string
    filterVariant?: FilterVariant
    filterOptions?: FilterOption[]
  }
}
