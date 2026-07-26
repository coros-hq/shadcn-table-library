'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'

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
        return (
          <button
            type="button"
            onClick={row.getToggleExpandedHandler()}
            className="flex items-center gap-1.5 font-medium"
          >
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform ${
                row.getIsExpanded() ? 'rotate-90' : ''
              }`}
            />
            {getValue() as string}
            <span className="font-normal text-muted-foreground">
              ({row.subRows.length})
            </span>
          </button>
        )
      }
      if (cell.getIsPlaceholder()) return null
      return <span className="pl-5">{getValue() as string}</span>
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
    cell: ({ cell, getValue }) => (
      <span className={cell.getIsAggregated() ? 'font-medium' : undefined}>
        {currency(getValue() as number)}
      </span>
    ),
  },
]
