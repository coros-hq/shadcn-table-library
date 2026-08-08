import '@tanstack/react-table'
import type { RowData } from '@tanstack/react-table'

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

// Module augmentation: adds `label`/`filterVariant`/`filterOptions` to every
// column's `meta` so FilterToolbar and useActiveFilters can read them without
// per-column wiring. TData/TValue must be re-declared to match TanStack's
// own signature or the merge is silently ignored.
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    label: string
    filterVariant?: FilterVariant
    filterOptions?: FilterOption[]
  }
}
