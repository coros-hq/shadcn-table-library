'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '#/components/ui/badge'
import { EditableCell } from './editable-cell'
import type { Row } from './data'

export const columns: ColumnDef<Row>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (context) => (
      <EditableCell context={context} field={{ type: 'text', rules: { required: true, max: 40 } }} />
    ),
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: (context) => {
      const { row } = context
      return (
        <EditableCell context={context} field={{ type: 'number', rules: { min: 0 } }}>
          <span className="tabular-nums">
            {row.original.price.toLocaleString('en-US')}
          </span>
        </EditableCell>
      )
    },
    meta: { align: 'right' },
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: (context) => {
      const { row } = context
      return (
        <EditableCell context={context} field={{ type: 'number', rules: { min: 0, integer: true } }}>
          <span className="tabular-nums">
            {row.original.stock.toLocaleString('en-US')}
          </span>
        </EditableCell>
      )
    },
    meta: { align: 'right' },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: (context) => {
      const { row } = context
      return (
        <EditableCell context={context} field={{ type: 'select', options: ['Electronics', 'Home', 'Clothing'] }}>
          <Badge variant="outline">{row.original.category}</Badge>
        </EditableCell>
      )
    },
  },
  {
    accessorKey: 'active',
    header: 'Active',
    cell: (context) => (
      <EditableCell context={context} field={{ type: 'checkbox' }} />
    ),
  },
]
