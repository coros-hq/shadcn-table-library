// Shared TanStack Table v9 feature registration used by every /v9 demo page.
// Registers stockFeatures plus every row-model factory and the full built-in
// fn registries, so v9 pages behave like v8's "everything is bundled" default.
// A real app should trim this to only the features/row models it actually
// uses (see the migrate-v8-to-v9 skill shipped in the package) for smaller
// bundles — this file favors parity over tree-shaking.
import {
  aggregationFns,
  createExpandedRowModel,
  createFacetedMinMaxValues,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createGroupedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  sortFns,
  stockFeatures,
  tableFeatures,
} from '@tanstack/react-table-v9'

export const v9Features = tableFeatures({
  ...stockFeatures,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  groupedRowModel: createGroupedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  facetedMinMaxValues: createFacetedMinMaxValues(),
  filterFns,
  sortFns,
  aggregationFns,
})

export type V9Features = typeof v9Features
