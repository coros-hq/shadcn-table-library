'use client'

import { format } from 'date-fns'

import type { ColumnDef, FilterFn } from '@tanstack/react-table'

export type Task = {
  id: string
  title: string
  category: string
  priority: string
  status: string
  dueDate: Date
}

const multiSelectFilter: FilterFn<Task> = (row, columnId, filterValue: string[]) => {
  if (!filterValue.length) return true
  return filterValue.includes(row.getValue(columnId))
}

const dateRangeFilter: FilterFn<Task> = (
  row,
  columnId,
  filterValue: { from?: Date; to?: Date },
) => {
  const value = row.getValue<Date>(columnId)
  if (filterValue.from && value < filterValue.from) return false
  if (filterValue.to && value > filterValue.to) return false
  return true
}

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    filterFn: multiSelectFilter,
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'dueDate',
    header: 'Due date',
    filterFn: dateRangeFilter,
    cell: ({ getValue }) => format(getValue<Date>(), 'MMM d, yyyy'),
  },
]
