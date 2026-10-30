import { createRawSnippet } from 'svelte'
import type { ColumnDef } from '@tanstack/table-core'
import {
  renderComponent,
  renderSnippet,
} from '$lib/components/ui/data-table/index.js'
import NameCell from './NameCell.svelte'
import ProductActions from './ProductActions.svelte'
import ReservedCell from './ReservedCell.svelte'
import SelectCheckbox from './SelectCheckbox.svelte'
import SkuCell from './SkuCell.svelte'
import StockCell from './StockCell.svelte'
import ThumbnailCell from './ThumbnailCell.svelte'
import UpdatedCell from './UpdatedCell.svelte'
import type { Product } from './data'

export const columns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      renderComponent(SelectCheckbox, {
        checked: table.getIsAllRowsSelected(),
        indeterminate:
          !table.getIsAllRowsSelected() && table.getIsSomeRowsSelected(),
        onchange: (value) => table.toggleAllRowsSelected(value),
        label: 'Select all products',
      }),
    cell: ({ row }) =>
      row.depth === 0
        ? renderComponent(SelectCheckbox, {
            checked: row.getIsSelected(),
            onchange: (value) => row.toggleSelected(value),
            label: `Select ${row.original.name}`,
          })
        : null,
    size: 32,
  },
  {
    id: 'thumbnail',
    header: () =>
      renderSnippet(
        createRawSnippet(() => ({
          render: () => `<span class="sr-only">Image</span>`,
        })),
      ),
    cell: ({ row }) => {
      const siblings = row.getParentRow()?.subRows ?? []
      return renderComponent(ThumbnailCell, {
        kind: row.original.kind,
        depth: row.depth,
        isLast: row.index === siblings.length - 1,
        expanded: row.getIsExpanded(),
      })
    },
    size: 48,
  },
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) =>
      renderComponent(NameCell, {
        name: row.original.name,
        muted: row.depth > 0,
      }),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) =>
      renderComponent(SkuCell, {
        sku: row.original.sku,
        name: row.original.name,
        canExpand: row.getCanExpand(),
        expanded: row.getIsExpanded(),
        onToggle: row.getToggleExpandedHandler(),
      }),
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) =>
      renderComponent(StockCell, {
        stock: row.original.stock,
        status: row.original.status,
      }),
  },
  {
    accessorKey: 'reserved',
    header: () =>
      renderSnippet(
        createRawSnippet(() => ({
          render: () => `<div class="text-right">Reserved</div>`,
        })),
      ),
    cell: ({ row }) =>
      renderComponent(ReservedCell, { reserved: row.original.reserved }),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }) =>
      renderComponent(UpdatedCell, { updatedAt: row.original.updatedAt }),
  },
  {
    id: 'actions',
    header: () =>
      renderSnippet(
        createRawSnippet(() => ({
          render: () => `<span class="sr-only">Actions</span>`,
        })),
      ),
    cell: ({ row }) =>
      row.depth === 0
        ? renderComponent(ProductActions, { name: row.original.name })
        : null,
    size: 72,
  },
]
