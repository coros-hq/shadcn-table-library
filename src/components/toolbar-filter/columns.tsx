'use client'

import type { ColumnDef } from '@tanstack/react-table'

export type Task = {
  id: string
  title: string
  category: string
  priority: string
  status: string
}

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equalsString',
  },
]
