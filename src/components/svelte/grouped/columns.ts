import type { ColumnDef } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import AmountCell from './AmountCell.svelte'
import CategoryToggle from './CategoryToggle.svelte'

export type Order = {
  id: string
  customer: string
  category: string
  amount: number
  status: string
}

const currency = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row, cell, getValue }) => {
      if (cell.getIsGrouped()) {
        return renderComponent(CategoryToggle, {
          label: getValue() as string,
          count: row.subRows.length,
          expanded: row.getIsExpanded(),
          onToggle: row.getToggleExpandedHandler(),
        })
      }
      if (cell.getIsPlaceholder()) return null
      return getValue() as string
    },
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ cell, getValue }) =>
      cell.getIsAggregated() ? null : (getValue() as string),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell, getValue }) =>
      cell.getIsAggregated() ? null : (getValue() as string),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    aggregationFn: 'sum',
    cell: ({ cell, getValue }) =>
      renderComponent(AmountCell, {
        text: currency(getValue() as number),
        bold: cell.getIsAggregated(),
      }),
  },
]
