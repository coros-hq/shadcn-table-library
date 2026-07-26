'use client'

import type { ColumnDef } from '@tanstack/react-table'

export type Task = {
  id: string
  title: string
  priority: string
  status: string
}

export const columns: ColumnDef<Task>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: 'Title',
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: 'Priority',
    sortingFn: 'basic',
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    sortingFn: 'basic',
  },
]
