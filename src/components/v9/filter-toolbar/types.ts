import { metaHelper, tableFeatures } from '@tanstack/react-table-v9'
import { v9Features } from '#/lib/table-v9-features.ts'

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

// v9 has no global declaration merging for ColumnMeta — a table registers
// its own meta shape as a type-only `columnMeta` slot on tableFeatures().
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
