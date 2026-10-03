import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ChevronRight } from '@lucide/vue'

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
        return h(
          'button',
          {
            type: 'button',
            onClick: row.getToggleExpandedHandler(),
            class: 'flex items-center gap-1.5 font-medium',
          },
          [
            h(ChevronRight, {
              class: [
                'h-3.5 w-3.5 transition-transform',
                row.getIsExpanded() && 'rotate-90',
              ],
            }),
            getValue() as string,
            h(
              'span',
              { class: 'font-normal text-muted-foreground' },
              `(${row.subRows.length})`,
            ),
          ],
        )
      }
      if (cell.getIsPlaceholder()) return null
      return h('span', { class: 'pl-5' }, getValue() as string)
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
      h(
        'span',
        { class: cell.getIsAggregated() ? 'font-medium' : undefined },
        currency(getValue() as number),
      ),
  },
]
