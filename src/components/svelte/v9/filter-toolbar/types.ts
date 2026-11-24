import { metaHelper, tableFeatures } from '@tanstack/svelte-table'
import { v9Features } from '$lib/table-v9-features'

export type FilterVariant =
  'text' | 'number' | 'dateRange' | 'select' | 'multiSelect'

export interface FilterOption {
  label: string
  value: string
}

export interface DateRangeValue {
  from?: Date
  to?: Date
}

// v9 has no global declaration merging for ColumnMeta — a table registers its
// own meta shape as a type-only `columnMeta` slot on tableFeatures().
interface FilterToolbarColumnMeta {
  label: string
  filterVariant?: FilterVariant
  filterOptions?: FilterOption[]
}

export const filterToolbarFeatures = tableFeatures({
  ...v9Features,
  columnMeta: metaHelper<FilterToolbarColumnMeta>(),
})

export type FilterToolbarFeatures = typeof filterToolbarFeatures
